package com.toeic_defense_backend.config;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SecurityConfig {

    @Value("${jwt.signerKey}")
    String signerKey;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        String[] publicEndpoints = {
                "/",
                "/index.html",
                "/home.html",
                "/home.js",
                "/exams.html",
                "/exams.js",
                "/result.html",
                "/result.js",
                "/profile.html",
                "/profile.js",
                "/login.html",
                "/login.js",
                "/admin.html",
                "/admin.js",
                "/admin-results.html",
                "/admin-results.js",
                "/register.html",
                "/register.js",
                "/change-password.js",

                "/style.css",
                "/exam.html",
                "/exam.js",
                "/api/auth/loginUnsafe",
                "/api/auth/loginSecure",
                "/api/auth/register"
        };

        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(request ->
                        request

                                // Cho phép truy cập frontend
                                .requestMatchers(publicEndpoints)
                                .permitAll()
                                .requestMatchers(HttpMethod.PUT, "/users/me")
                                .authenticated()
                                .requestMatchers(HttpMethod.PUT, "/users/me/lab-vulnerable")
                                .authenticated()
                                .requestMatchers(HttpMethod.GET, "/users/me")
                                .authenticated()
                                .requestMatchers(HttpMethod.GET, "/profiles/me")
                                .authenticated()
                                .requestMatchers(HttpMethod.PUT, "/profiles/me")
                                .authenticated()

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/exams/**",
                                        "/api/exams/**",
                                        "/questions/**"
                                )
                                .authenticated()

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/exam-results/submit"
                                )
                                .authenticated()

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/exam-results/me"
                                )
                                .authenticated()

                                .requestMatchers(
                                        "/exams/**",
                                        "/questions/**",
                                        "/exam-results/**"
                                )
                                .hasAuthority("ADMIN")

                                .requestMatchers(
                                        "/exam-answers/**",
                                        "/users/**",
                                        "/profiles/**"
                                )
                                .hasAuthority("ADMIN")

                                .anyRequest()
                                .authenticated()
                )

                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter()
                                )
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                );

        return http.build();
    }


    @Bean
    public JwtDecoder jwtDecoder() {

        SecretKeySpec secretKeySpec =
                new SecretKeySpec(
                        signerKey.getBytes(),
                        "HS512"
                );

        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }


    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        authoritiesConverter.setAuthoritiesClaimName("role");

        authoritiesConverter.setAuthorityPrefix("");


        JwtAuthenticationConverter authenticationConverter =
                new JwtAuthenticationConverter();

        authenticationConverter
                .setJwtGrantedAuthoritiesConverter(
                        authoritiesConverter
                );

        return authenticationConverter;
    }


    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}
