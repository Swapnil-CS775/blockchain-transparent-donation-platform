package com.ngoplatform.security.jwt;

import com.ngoplatform.config.JwtProperties;
import com.ngoplatform.user.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Claims;

import java.security.Key;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties jwtProperties;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes());
    }

    public String generateToken(User user) {

        return Jwts.builder()
                .claim("userId", user.getId())
                .claim("walletAddress", user.getWalletAddress())
                .claim("role", user.getRole().name())
                .claim("accountStatus", user.getAccountStatus().name())
                .claim("isVerified", user.getIsVerified())
                .claim("tokenVersion", user.getTokenVersion())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration()))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractWallet(String token) {
        return extractAllClaims(token).get("walletAddress", String.class);
    }

    public boolean isTokenValid(String token, User user) {

        final String wallet = extractWallet(token);

        return wallet.equals(user.getWalletAddress())
                && !isTokenExpired(token)
                && extractAllClaims(token).get("tokenVersion", Integer.class)
                .equals(user.getTokenVersion());
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }
}
