const API_BASE_URL = "http://localhost:8080";
const accessToken = localStorage.getItem("toeicAccessToken");
const adminMessage = document.getElementById("adminMessage");
const adminExamList = document.getElementById("adminExamList");
const usernameElement = document.getElementById("username");
const username = localStorage.getItem("username");

if (usernameElement && username) {
    usernameElement.textContent = `Xin chào ${username}`;
}

if (!accessToken) {
    window.location.href = "login.html";
}

const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));

if (tokenPayload.role !== "ADMIN") {
    window.location.href = "home.html";
}

function showMessage(message, isSuccess = false) {
    adminMessage.textContent = message;
    adminMessage.className = isSuccess ? "auth-message success" : "auth-message error";
}

function normalizeCorrectAnswer(value) {
    const answer = String(value || "").trim().toUpperCase();
    if (!/^[A-D]$/.test(answer)) {
        throw new Error("Đáp án đúng phải là A, B, C hoặc D.");
    }
    return answer;
}

function readInlinePdfOptions(line, currentQuestion) {
    const optionMatches = [...line.matchAll(/\(([A-D])\)\s*([^()]*?)(?=\s+\([A-D]\)\s*|$)/gi)];
    if (optionMatches.length < 2 || !currentQuestion) {
        return false;
    }

    optionMatches.forEach((match) => {
        currentQuestion.options[match[1].toUpperCase()] = match[2].trim();
    });

    return true;
}

async function sendRequest(path, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(body)
    });

    const text = await response.text();
    let data = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch (error) {
        data = { message: text };
    }

    if (!response.ok) {
        throw new Error(data.message || data.error || `Thao tác thất bại (${response.status}).`);
    }

    return data;
}

async function loadAdminExams() {
    const response = await fetch(`${API_BASE_URL}/exams`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
        throw new Error("Không thể tải danh sách đề thi.");
    }

    const result = await response.json();
    const exams = result.data || [];

    if (!exams.length) {
        adminExamList.innerHTML = "<p>Hiện chưa có đề thi nào.</p>";
        return;
    }

    adminExamList.innerHTML = exams.map((exam) => `
        <div class="exam-card">
            <h3>${escapeHtml(exam.title || `Đề thi ${exam.id}`)}</h3>
            <p>ID: ${exam.id}</p>
            <button type="button" class="delete-exam-button" data-exam-id="${exam.id}">
                Xóa đề thi
            </button>
        </div>
    `).join("");
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

adminExamList.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest(".delete-exam-button");
    if (!deleteButton) return;

    const examId = deleteButton.dataset.examId;
    if (!window.confirm(`Bạn có chắc muốn xóa đề thi ID ${examId}?`)) return;

    deleteButton.disabled = true;
    try {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Xóa đề thi thất bại (${response.status}).`);
        }

        showMessage(`Đã xóa đề thi ID ${examId}.`, true);
        await loadAdminExams();
    } catch (error) {
        deleteButton.disabled = false;
        showMessage(error.message || "Không thể xóa đề thi.");
    }
});

document.getElementById("examForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const result = await sendRequest("/exams", {
            title: document.getElementById("examTitle").value.trim(),
            description: document.getElementById("examDescription").value.trim()
        });
        const examId = result.data && result.data.id;
        showMessage(`Đã tạo đề thi${examId ? `, ID là ${examId}` : ""}. Hãy dùng ID này để thêm câu hỏi.`, true);
        event.target.reset();
        await loadAdminExams();
    } catch (error) {
        showMessage(error.message);
    }
});

document.getElementById("questionForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        await sendRequest("/questions", {
            examId: Number(document.getElementById("questionExamId").value),
            questionNumber: Number(document.getElementById("questionNumber").value),
            content: document.getElementById("questionContent").value.trim(),
            optionA: document.getElementById("optionA").value.trim(),
            optionB: document.getElementById("optionB").value.trim(),
            optionC: document.getElementById("optionC").value.trim(),
            optionD: document.getElementById("optionD").value.trim()
        });
        await sendRequest("/exam-answers", {
            examId: Number(document.getElementById("questionExamId").value),
            questionNumber: Number(document.getElementById("questionNumber").value),
            correctAnswer: normalizeCorrectAnswer(document.getElementById("correctAnswer").value),
            explanation: ""
        });
        showMessage("Đã thêm câu hỏi.", true);
        event.target.reset();
    } catch (error) {
        showMessage(error.message);
    }
});

function parseWordQuestions(rawText) {
    const lines = rawText
        .replace(/\r/g, "")
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    const questions = [];
    let currentQuestion = null;

    const flushQuestion = () => {
        if (!currentQuestion) return;
        const { questionNumber, content, options } = currentQuestion;
        const normalized = {
            questionNumber,
            content: content.trim(),
            optionA: (options.A || "").trim(),
            optionB: (options.B || "").trim(),
            optionC: (options.C || "").trim(),
            optionD: (options.D || "").trim(),
            correctAnswer: currentQuestion.correctAnswer || "",
        };

        if (normalized.content && normalized.optionA && normalized.optionB && normalized.optionC && normalized.optionD) {
            questions.push(normalized);
        }
        currentQuestion = null;
    };

    for (const line of lines) {
        const questionMatch = line.match(/^(?:Câu|Question|Q|QUESTION)\s*(\d+)[.:\-\s]*(.*)$/i) ||
            line.match(/^(\d+)[.):\-]\s*(.*)$/);

        if (questionMatch) {
            flushQuestion();
            const questionNumber = Number(questionMatch[1]);
            const content = (questionMatch[2] || "").trim();
            currentQuestion = {
                questionNumber,
                content,
                options: {},
            };
            continue;
        }

        if (readInlinePdfOptions(line, currentQuestion)) {
            continue;
        }

        const optionMatch = line.match(/^\(?([A-D])\)?[.):\-]?\s+(.*)$/i);
        if (optionMatch && currentQuestion) {
            const optionKey = optionMatch[1].toUpperCase();
            currentQuestion.options[optionKey] = optionMatch[2] || "";
            continue;
        }

        const answerMatch = line.match(/^(?:Đáp án đúng|Đáp án|Answer|Correct answer|ĐA)\s*[:\-]?\s*\(?([A-D])\)?\b/i);
        if (answerMatch && currentQuestion) {
            currentQuestion.correctAnswer = answerMatch[1].toUpperCase();
            continue;
        }

        if (currentQuestion) {
            if (!currentQuestion.content) {
                currentQuestion.content = line;
            } else {
                currentQuestion.content += ` ${line}`;
            }
        }
    }

    flushQuestion();

    return questions;
}

async function extractPdfText(arrayBuffer) {
    if (!window.pdfjsLib) {
        throw new Error("Chưa tải được thư viện đọc PDF. Hãy kiểm tra kết nối mạng và tải lại trang.");
    }

    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageLines = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const items = textContent.items
            .filter((item) => item.str && item.str.trim())
            .map((item) => ({
                text: item.str.trim(),
                x: item.transform[4],
                y: item.transform[5]
            }))
            .sort((first, second) => second.y - first.y || first.x - second.x);

        const lines = [];
        for (const item of items) {
            const lastLine = lines[lines.length - 1];
            if (!lastLine || Math.abs(lastLine.y - item.y) > 3) {
                lines.push({ y: item.y, text: item.text });
            } else {
                lastLine.text += ` ${item.text}`;
            }
        }

        pageLines.push(lines.map((line) => line.text).join("\n"));
    }

    return pageLines.join("\n");
}

async function importParsedQuestions(questions, examId, sourceName) {

    if (!questions.length) {
        throw new Error(`Không trích xuất được câu hỏi từ ${sourceName}. Hãy kiểm tra định dạng.`);
    }

    if (!examId) {
        throw new Error("Vui lòng nhập ID đề thi đúng.");
    }

    let missingAnswerCount = 0;
    for (let index = 0; index < questions.length; index += 1) {
        const question = questions[index];
        await sendRequest("/questions", {
            examId,
            questionNumber: Number(question.questionNumber),
            content: question.content,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD
        });
        if (question.correctAnswer) {
            await sendRequest("/exam-answers", {
                examId,
                questionNumber: Number(question.questionNumber),
                correctAnswer: normalizeCorrectAnswer(question.correctAnswer),
                explanation: question.explanation || ""
            });
        } else {
            missingAnswerCount += 1;
        }
        showMessage(`Đang nhập ${index + 1}/${questions.length} câu hỏi...`);
    }

    const answerMessage = missingAnswerCount
        ? ` Chưa có đáp án đúng cho ${missingAnswerCount} câu.`
        : "";
    showMessage(`Đã nhập ${questions.length} câu hỏi từ ${sourceName}.${answerMessage}`, true);
}

document.getElementById("uploadPdfBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("pdfFileInput");
    const file = fileInput.files && fileInput.files[0];

    try {
        if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
            throw new Error("Vui lòng chọn file PDF.");
        }

        const examId = Number(document.getElementById("pdfExamId").value);
        const text = await extractPdfText(await file.arrayBuffer());
        await importParsedQuestions(parseWordQuestions(text), examId, "file PDF");
    } catch (error) {
        showMessage(error.message || "Không thể đọc file PDF.");
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("toeicAccessToken");
    localStorage.removeItem("username");
    window.location.href = "login.html";
});

loadAdminExams().catch((error) => showMessage(error.message));
