// ===============================
// CẤU HÌNH API BACKEND
// ===============================

const API_BASE_URL = window.location.protocol.startsWith("http")
    ? ""
    : "http://localhost:8090";


// ===============================
// LẤY CÁC PHẦN TỬ HTML
// ===============================

const examForm = document.getElementById("examForm");
const examTitle = document.getElementById("examTitle");
const examMessage = document.getElementById("examMessage");
const scoreModal = document.getElementById("scoreModal");
const scoreValue = document.getElementById("scoreValue");

const timeElement = document.getElementById("time");
const answeredCountElement = document.getElementById("answeredCount");
const footerAnsweredCount = document.getElementById("footerAnsweredCount");

const questionSummary = document.getElementById("questionSummary");
const submitExamButton = document.getElementById("submitExamButton");


// ===============================
// THÔNG TIN ĐỀ THI
// ===============================

const examId = new URLSearchParams(window.location.search).get("id");

const accessToken =
    localStorage.getItem("toeicAccessToken") || "";


// Thời gian làm bài: 120 phút
const examDurationMinutes = 120;

let questions = [];

let countdownSeconds =
    examDurationMinutes * 60;

let countdownTimer;

let submitted = false;


// ===============================
// ESCAPE HTML
// ===============================

function normalizeQuestions(rawQuestions) {

    const seenQuestionNumbers = new Set();
    const seenQuestionContent = new Set();

    return rawQuestions
        .filter((question) => {
            const questionNumber = Number(question.questionNumber);
            const contentKey = [
                question.content,
                question.optionA,
                question.optionB,
                question.optionC,
                question.optionD
            ]
                .map((value) => String(value ?? "").trim().toLowerCase())
                .join("|");

            if (Number.isInteger(questionNumber) && questionNumber > 0) {
                if (seenQuestionNumbers.has(questionNumber)) {
                    return false;
                }

                seenQuestionNumbers.add(questionNumber);
                return true;
            }

            if (seenQuestionContent.has(contentKey)) {
                return false;
            }

            seenQuestionContent.add(contentKey);
            return true;
        })
        .sort((firstQuestion, secondQuestion) => {
            const firstNumber = Number(firstQuestion.questionNumber);
            const secondNumber = Number(secondQuestion.questionNumber);

            if (Number.isInteger(firstNumber) && Number.isInteger(secondNumber)) {
                return firstNumber - secondNumber;
            }

            return 0;
        });
}

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// HIỂN THỊ THÔNG BÁO
// ===============================

function showMessage(message, type = "") {

    examMessage.textContent = message;

    examMessage.className =
        `exam-message ${type}`;
}


// ===============================
// CẬP NHẬT SỐ CÂU ĐÃ LÀM
// ===============================

function updateAnsweredCount() {

    const answered =
        examForm.querySelectorAll(
            "input[type='radio']:checked"
        ).length;

    const countText =
        `${answered}/${questions.length}`;

    answeredCountElement.textContent =
        countText;

    footerAnsweredCount.textContent =
        `Đã làm ${countText} câu`;
}


// ===============================
// ĐỒNG HỒ ĐẾM NGƯỢC
// ===============================

function updateTimer() {

    const hours =
        Math.floor(countdownSeconds / 3600);

    const minutes =
        Math.floor(
            (countdownSeconds % 3600) / 60
        );

    const seconds =
        countdownSeconds % 60;


    const formattedHours =
        String(hours).padStart(2, "0");

    const formattedMinutes =
        String(minutes).padStart(2, "0");

    const formattedSeconds =
        String(seconds).padStart(2, "0");


    timeElement.textContent =
        `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;


    // Còn 5 phút thì cảnh báo
    if (countdownSeconds <= 300) {

        timeElement.classList.add(
            "time-warning"
        );
    }
}


// ===============================
// BẮT ĐẦU ĐẾM GIỜ
// ===============================

function startCountdown() {

    updateTimer();

    countdownTimer =
        window.setInterval(() => {

            countdownSeconds--;

            updateTimer();


            // Hết giờ
            if (countdownSeconds <= 0) {

                clearInterval(
                    countdownTimer
                );

                submitExam(true);
            }

        }, 1000);
}


// ===============================
// HIỂN THỊ CÂU HỎI
// ===============================

function renderQuestions() {

    examForm.innerHTML =
        questions.map((question, index) => {

            const number =
                question.questionNumber || index + 1;


            const options = [

                ["A", question.optionA],

                ["B", question.optionB],

                ["C", question.optionC],

                ["D", question.optionD]

            ];


            return `

            <fieldset class="question-card">

                <legend>
                    Câu ${number}:
                    ${escapeHtml(question.content)}
                </legend>


                <div class="answer-options">

                    ${options.map(([value, label]) => `

                        <label class="answer-option">

                            <input
                                type="radio"
                                name="question-${question.id}"
                                value="${value}"
                            >

                            <span>

                                <strong>${value}.</strong>

                                ${escapeHtml(label)}

                            </span>

                        </label>

                    `).join("")}

                </div>

            </fieldset>

            `;

        }).join("");


    // Theo dõi khi người dùng chọn đáp án
    examForm.addEventListener(
        "change",
        updateAnsweredCount
    );


    updateAnsweredCount();
}


// ===============================
// TẢI THÔNG TIN ĐỀ THI
// ===============================

async function loadExamInfo() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/exams/${examId}`,
                {
                    headers: accessToken
                        ? {
                            Authorization:
                                `Bearer ${accessToken}`
                        }
                        : {}
                }
            );


        if (!response.ok) {

            throw new Error(
                `Không thể tải đề thi (${response.status})`
            );
        }


        const data =
            await response.json();


        const exam =
            data.data || data;


        // Hiển thị tên đề thi
        examTitle.textContent =
            exam.title || `Đề thi số ${examId}`;


    } catch (error) {

        console.error(
            "Lỗi tải thông tin đề:",
            error
        );


        // Nếu không lấy được vẫn hiển thị ID
        examTitle.textContent =
            `Đề thi số ${examId}`;
    }
}


// ===============================
// TẢI CÂU HỎI THEO ĐỀ THI
// ===============================

async function loadQuestions() {

    try {

        showMessage(
            "Đang tải câu hỏi..."
        );


        const response =
            await fetch(
                `${API_BASE_URL}/questions/exam/${examId}`,
                {
                    headers: accessToken
                        ? {
                            Authorization:
                                `Bearer ${accessToken}`
                        }
                        : {}
                }
            );


        if (!response.ok) {

            throw new Error(
                `Không thể tải câu hỏi (${response.status})`
            );
        }


        const data =
            await response.json();


        questions =
            normalizeQuestions(
                Array.isArray(data.data) ? data.data : []
            );


        if (
            !Array.isArray(questions)
            ||
            questions.length === 0
        ) {

            throw new Error(
                "Đề thi này chưa có câu hỏi."
            );
        }


        questionSummary.textContent =
            `${questions.length} câu hỏi`;


        showMessage("");


        renderQuestions();


        startCountdown();


    } catch (error) {

        console.error(error);


        examForm.innerHTML =
            `<p class="loading-text">
                Không thể tải câu hỏi.
            </p>`;


        showMessage(
            error.message ||
            "Không thể tải đề thi."
        );
    }
}


// ===============================
// LOAD TOÀN BỘ ĐỀ THI
// ===============================

async function loadExam() {

    if (!examId) {

        showMessage(
            "Không tìm thấy mã đề thi."
        );

        submitExamButton.disabled = true;

        return;
    }


    await loadExamInfo();

    await loadQuestions();
}


// ===============================
// NỘP BÀI
// ===============================

async function submitExam(isTimeUp = false) {

    if (
        submitted ||
        questions.length === 0
    ) {

        return;
    }


    // Lấy đáp án người dùng chọn
    const answers =
        questions.map((question, index) => {

            const number =
                question.questionNumber || index + 1;


            const selected =
                examForm.querySelector(
                    `input[name="question-${question.id}"]:checked`
                );


            return {
                questionNumber:
                    number,

                selectedAnswer:
                    selected
                        ? selected.value
                        : ""

            };

        });


    if (
        !isTimeUp
        &&
        answers.some(
            answer =>
                !answer.selectedAnswer
        )
    ) {

        showMessage(
            "Hãy trả lời tất cả câu hỏi trước khi nộp bài."
        );

        return;
    }


    submitted = true;


    clearInterval(
        countdownTimer
    );


    submitExamButton.disabled =
        true;


    showMessage(
        isTimeUp
            ? "Đã hết giờ, đang nộp bài..."
            : "Đang nộp bài..."
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/exam-results/submit`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        ...(accessToken
                            ? {
                                Authorization:
                                    `Bearer ${accessToken}`
                            }
                            : {})

                    },


                    body:
                        JSON.stringify({

                            examId:
                                Number(examId),

                            answers:
                                answers

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                `Nộp bài thất bại (${response.status})`
            );
        }


        const data =
            await response.json();


        const result =
            data.data || data;


        const score = result.score ?? 0;

        examMessage.textContent = "";
        examMessage.className = "exam-message";
        scoreValue.textContent = score;
        scoreModal.hidden = false;
        document.body.classList.add("modal-open");


    } catch (error) {

        console.error(error);


        submitted = false;


        submitExamButton.disabled =
            false;


        showMessage(
            error.message ||
            "Nộp bài không thành công."
        );
    }
}


// ===============================
// SỰ KIỆN NỘP BÀI
// ===============================

examForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        submitExam();

    }
);


// ===============================
// BẮT ĐẦU
// ===============================

loadExam();
