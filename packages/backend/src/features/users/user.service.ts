import { injectable, inject } from 'inversify';
import type { PublicUserProfile } from '@wishlist/shared';
import { TYPES } from '../../types.js';
import type { IUserRepository } from './user.repository.js';
import type { ILogger } from '../../lib/logger.js';

export interface IUserService {
  getPublicProfile(userId: string): Promise<PublicUserProfile>;
}

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository) private repository: IUserRepository,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async getPublicProfile(userId: string): Promise<PublicUserProfile> {
    this.logger.debug(`Fetching public profile for user: ${userId}`);

    const user = await this.repository.findById(userId);

    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    const stats = await this.repository.getUserStats(userId);

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      stats,
    };
  }
}
