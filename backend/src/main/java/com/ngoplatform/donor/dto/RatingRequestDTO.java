package com.ngoplatform.donor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class RatingRequestDTO {
    private Integer stars;
    private String description;
    private String transactionHash;
}