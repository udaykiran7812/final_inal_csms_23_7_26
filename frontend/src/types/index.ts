export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type TicketStatus = 'CREATED' | 'ASSIGNED' | 'ACCEPTED' | 'IN_PROGRESS' | 'PENDING_USER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  email: string;
  role: string;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: string;
  active: boolean;
}

export interface CreateUserRequest {
  firstName: string;
  lastName?: string;
  email: string;
  password?: string;
  phone?: string;
  roleId: number;
}

export interface StaffResponse {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  departmentId: number;
  departmentName: string;
  subDepartmentId?: number | null;
  subDepartmentName?: string | null;
  roleId?: number | null;
  roleName?: string | null;
  roleIds?: number[];
  roleNames?: string[];
  departmentIds?: number[];
  departmentNames?: string[];
  subDepartmentIds?: number[];
  subDepartmentNames?: string[];
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  departmentId: number;
  subDepartmentId?: number | null;
  roleId?: number | null;
  roleIds?: number[];
  departmentIds?: number[];
  subDepartmentIds?: number[];
}

export interface DepartmentResponse {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  adminEmail?: string | null;
  adminName?: string | null;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  adminEmail?: string;
  adminPassword?: string;
  adminFirstName?: string;
  adminLastName?: string;
}

export interface SubDepartmentResponse {
  id: number;
  name: string;
  description: string | null;
  departmentId: number;
  departmentName: string;
  active: boolean;
}

export interface CreateSubDepartmentRequest {
  name: string;
  description?: string;
  departmentId: number;
}

export interface IssueCategoryResponse {
  id: number;
  name: string;
  description: string | null;
}

export interface CreateIssueCategoryRequest {
  name: string;
  description?: string;
}

export interface RoleResponse {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  departmentId?: number | null;
  departmentName?: string | null;
  subDepartmentId?: number | null;
  subDepartmentName?: string | null;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  departmentId?: number | null;
  subDepartmentId?: number | null;
}

export interface SlaRuleResponse {
  id: number;
  departmentId: number | null;
  departmentName: string;
  subDepartmentId: number | null;
  subDepartmentName: string;
  priorityId: number;
  priorityName: string;
  userRole: string;
  responseTimeLimitMinutes: number;
  resolutionTimeLimitMinutes: number;
  active: boolean;
}

export interface CreateSlaRuleRequest {
  departmentId?: number | null;
  subDepartmentId?: number | null;
  priorityId: number;
  userRole?: string;
  responseTimeLimitMinutes: number;
  resolutionTimeLimitMinutes: number;
}

export interface PriorityResponse {
  id: number;
  name: string;
  displayColor: string | null;
  active: boolean;
}

export interface CreatePriorityRequest {
  name: string;
  displayColor?: string;
}

export interface EscalationRuleResponse {
  id: number;
  slaRuleId: number;
  priorityName: string | null;
  slaUserRole: string | null;
  triggerAfterMinutes: number;
  escalationLevel: number;
  notifyRole: string;
  active: boolean;
}

export interface CreateEscalationRuleRequest {
  slaRuleId: number;
  triggerAfterMinutes: number;
  escalationLevel: number;
  notifyRole: string;
}

export interface EscalationHistoryResponse {
  id: number;
  ticketId: number;
  escalationLevel: number;
  notifiedUserId: number;
  notifiedUserName: string;
  triggeredAt: string;
}

export interface BusinessHoursResponse {
  id: number;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface CreateBusinessHoursRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface HolidayResponse {
  id: number;
  holidayDate: string;
  name: string;
  active: boolean;
}

export interface CreateHolidayRequest {
  holidayDate: string;
  name: string;
}

export interface TicketResponse {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  userName: string;
  departmentId?: number | null;
  departmentName: string;
  subDepartmentId?: number | null;
  subDepartmentName?: string | null;
  issueCategoryName: string;
  assignedStaffName: string | null;
  assetId?: number | null;
  assetName: string | null;
  assetTag?: string | null;
  slaResponseDeadline: string | null;
  slaResolutionDeadline: string | null;
  respondedAt: string | null;
  resolvedAt: string | null;
  slaBreached: boolean;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: string;
  userId: number;
  departmentId: number;
  subDepartmentId?: number | null;
  issueCategoryId: number;
  assignedStaffId?: number | null;
  assetId?: number | null;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export interface UpdateTicketPriorityRequest {
  priority: TicketPriority;
}

export interface AssignStaffRequest {
  staffId: number;
}

export interface AssetResponse {
  id: number;
  name: string;
  assetTag: string;
  type: string;
  location: string;
  departmentId: number;
  departmentName: string;
  status: string;
  active: boolean;
  createdAt: string;
}

export interface CreateAssetRequest {
  name: string;
  assetTag: string;
  type: string;
  location: string;
  departmentId: number;
  status: string;
}

export interface ScoreEventDto {
  ticketId?: number;
  ticketTitle?: string;
  eventType?: string;
  points: number;
  reason: string;
  timestamp: string;
}

export interface DashboardStatsResponse {
  totalUsers: number;
  totalStaff: number;
  totalDepartments: number;
  totalSubDepartments: number;
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  completedTickets: number;
  slaBreaches: number;
  averageResolutionTimeHours: number;
  ticketsByStatus?: Record<string, number>;
  ticketsByPriority?: Record<string, number>;
  ticketsByDepartment?: Record<string, number>;
  staffWorkload?: Record<string, number>;
  departmentSlaBreachRates?: Record<string, number>;
  departmentPerformance?: Array<{
    departmentName: string;
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    slaBreachedTickets: number;
    slaCompliancePercentage: number;
    healthScore?: number;
    scoreBreakdown?: ScoreEventDto[];
  }>;
  staffPerformance?: Array<{
    staffId: number;
    staffName: string;
    email: string;
    departmentName: string;
    subDepartmentName: string;
    roleName: string;
    assignedTickets: number;
    resolvedTickets: number;
    slaBreaches: number;
    healthScore?: number;
    rank?: number;
    achievementBadges?: string[];
    monthlyTrend?: number;
    avgResolutionTimeHours?: number;
    avgRating?: number;
    scoreBreakdown?: ScoreEventDto[];
  }>;
}

export interface TicketHistoryResponse {
  id: number;
  ticketId: number;
  action: string;
  createdAt: string;
}

export interface SlaChangeRequestResponse {
  id: number;
  requesterId: number;
  requesterName: string;
  requesterEmail: string;
  priorityName: string;
  userRole: string;
  proposedResponseTimeLimitMinutes: number;
  proposedResolutionTimeLimitMinutes: number;
  justification: string;
  status: string;
  adminNotes?: string | null;
  createdAt: string;
}

export interface CreateSlaChangeRequest {
  priorityName: string;
  userRole: string;
  proposedResponseTimeLimitMinutes: number;
  proposedResolutionTimeLimitMinutes: number;
  justification?: string;
}

export interface AuditLogResponse {
  id: number;
  performedBy: string;
  action: string;
  entityName: string;
  entityId: number;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
}

