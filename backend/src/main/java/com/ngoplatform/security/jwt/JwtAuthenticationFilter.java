package com.ngoplatform.security.jwt;

import com.ngoplatform.user.entity.User;
import com.ngoplatform.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
    	

        String path = request.getRequestURI();

        // ✅ Allow auth endpoints without JWT
        if (path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        System.out.println("---- JWT FILTER START ----");
    	System.out.println("Path: " + request.getRequestURI());
    	System.out.println("Auth Header: " + authHeader);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String walletAddress = jwtService.extractWallet(token);
            System.out.println("Extracted wallet: " + walletAddress);
            if (walletAddress != null
                    && SecurityContextHolder.getContext().getAuthentication() == null) {

                User user = userRepository
                        .findByWalletAddress(walletAddress)
                        .orElse(null);
                System.out.println("DB user: " + user);
                if (user != null && jwtService.isTokenValid(token, user)) {
                	
                    var authorities = List.of(
                            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                    );

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    authorities
                            );

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }

        } catch (Exception e) {
            // Invalid token — do not crash app
        }

        filterChain.doFilter(request, response);
    }
}
