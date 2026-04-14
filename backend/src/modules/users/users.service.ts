import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../schemas/user.schema';
import { UserRole } from '../../common/enums';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async findAll(page = 1, limit = 20, search?: string, role?: string) {
    const skip = (page - 1) * limit;
    const filter: FilterQuery<User> = {};

    if (search?.trim()) {
      const regex = new RegExp(this.escapeRegex(search.trim()), 'i');
      filter.$or = [{ email: regex }, { name: regex }];
    }
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      filter.role = role;
    }

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) throw new ConflictException('Email already exists');
    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.userModel.create({
      email: dto.email,
      passwordHash: hash,
      name: dto.name,
      role: dto.role ?? UserRole.USER,
    });
    return this.userModel.findById(user._id).lean().exec();
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userModel
      .findById(id)
      .select('+passwordHash')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userModel
        .findOne({ email: dto.email })
        .exec();
      if (existing) throw new ConflictException('Email already exists');
      user.email = dto.email;
    }
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 12);
    }
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.role !== undefined) user.role = dto.role;
    await user.save();
    return this.userModel.findById(id).lean().exec();
  }

  async remove(id: string) {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('User not found');
    return { deleted: true };
  }

  async bulkAction(action: string, ids: string[]) {
    if (!ids.length) return { affected: 0 };
    if (action === 'delete') {
      const result = await this.userModel
        .deleteMany({ _id: { $in: ids } })
        .exec();
      return { affected: result.deletedCount };
    }
    return { affected: 0 };
  }
}
