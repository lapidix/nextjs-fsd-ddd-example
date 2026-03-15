import { MockRepository, RepositoryMockFactory } from "@/shared/libs/__tests__";
import { UserEntity } from "../../types";

export interface MockUserRepository extends MockRepository<UserEntity> {
  getUserProfile: ReturnType<typeof vi.fn>;
  getCurrentUserProfile: ReturnType<typeof vi.fn>;
  findByUsername: ReturnType<typeof vi.fn>;
  findByEmail: ReturnType<typeof vi.fn>;
  existsByUsername: ReturnType<typeof vi.fn>;
  existsByEmail: ReturnType<typeof vi.fn>;
}

export const UserRepositoryMocks = {
  create: (): MockUserRepository => ({
    ...RepositoryMockFactory.createBasicMock<UserEntity>(),
    getUserProfile: vi.fn(),
    getCurrentUserProfile: vi.fn(),
    findByUsername: vi.fn(),
    findByEmail: vi.fn(),
    existsByUsername: vi.fn(),
    existsByEmail: vi.fn(),
  }),

  createSuccess: (
    mockUser: UserEntity,
    mockUsers: UserEntity[] = []
  ): MockUserRepository => ({
    ...RepositoryMockFactory.createSuccessMock(mockUser, mockUsers),
    getUserProfile: vi.fn().mockResolvedValue(mockUser),
    getCurrentUserProfile: vi.fn().mockResolvedValue(mockUser),
    findByUsername: vi.fn().mockResolvedValue(mockUser),
    findByEmail: vi.fn().mockResolvedValue(mockUser),
    existsByUsername: vi.fn().mockResolvedValue(true),
    existsByEmail: vi.fn().mockResolvedValue(true),
  }),

  createNotFound: (): MockUserRepository => ({
    ...RepositoryMockFactory.createNotFoundMock<UserEntity>(),
    getUserProfile: vi.fn().mockResolvedValue(null),
    getCurrentUserProfile: vi.fn().mockResolvedValue(null),
    findByUsername: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn().mockResolvedValue(null),
    existsByUsername: vi.fn().mockResolvedValue(false),
    existsByEmail: vi.fn().mockResolvedValue(false),
  }),

  createError: (
    error: Error = new Error("User Repository Error")
  ): MockUserRepository => ({
    ...RepositoryMockFactory.createErrorMock<UserEntity>(error),
    getUserProfile: vi.fn().mockRejectedValue(error),
    getCurrentUserProfile: vi.fn().mockRejectedValue(error),
    findByUsername: vi.fn().mockRejectedValue(error),
    findByEmail: vi.fn().mockRejectedValue(error),
    existsByUsername: vi.fn().mockRejectedValue(error),
    existsByEmail: vi.fn().mockRejectedValue(error),
  }),

  createDuplicate: (mockUser: UserEntity): MockUserRepository => ({
    ...RepositoryMockFactory.createBasicMock<UserEntity>(),
    getUserProfile: vi.fn().mockResolvedValue(mockUser),
    getCurrentUserProfile: vi.fn().mockResolvedValue(mockUser),
    findById: vi.fn().mockResolvedValue(mockUser),
    findAll: vi.fn().mockResolvedValue([mockUser]),
    findByUsername: vi.fn().mockResolvedValue(mockUser),
    findByEmail: vi.fn().mockResolvedValue(mockUser),
    existsByUsername: vi.fn().mockResolvedValue(true),
    existsByEmail: vi.fn().mockResolvedValue(true),
    save: vi
      .fn()
      .mockRejectedValue(new Error("Username or email already exists")),
    update: vi.fn().mockResolvedValue(mockUser),
    delete: vi.fn().mockResolvedValue(undefined),
  }),
};
