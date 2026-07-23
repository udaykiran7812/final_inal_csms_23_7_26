package com.csms.sla.service;

import com.csms.common.response.ApiResponse;
import com.csms.sla.dto.request.CreateSlaChangeRequest;
import com.csms.sla.dto.response.SlaChangeRequestResponse;

import java.util.List;

public interface SlaChangeRequestService {
    ApiResponse<SlaChangeRequestResponse> submitRequest(CreateSlaChangeRequest request, String userEmail);
    ApiResponse<List<SlaChangeRequestResponse>> getAllRequests();
    ApiResponse<SlaChangeRequestResponse> approveRequest(Long requestId, String adminNotes);
    ApiResponse<SlaChangeRequestResponse> rejectRequest(Long requestId, String adminNotes);
}
