package com.ngoplatform.ngo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StakeholderResponseDTO {
	private String fullName;
    private String designation;
}
