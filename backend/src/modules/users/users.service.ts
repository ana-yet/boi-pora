import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.userModel.find().select('-passwordHash').skip(skip).limit(limit).lean().exec(),
      this.userModel.countDocuments().exec(),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-passwordHash').lean().exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.userModel.create({
      email: dto.email,
      passwordHash: hash,
      name: dto.name,
      role: dto.role ?? 'user',
    });
    const obj = user.toObject();
    delete (obj as unknown as Record<string, unknown>).passwordHash;
    return obj;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userModel.findOne({ email: dto.email }).exec();
      if (existing) {
        throw new ConflictException('Email already exists');
      }
      user.email = dto.email;
    }
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 12);
    }
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.role !== undefined) user.role = dto.role;
    await user.save();
    const obj = user.toObject();
    delete (obj as unknown as Record<string, unknown>).passwordHash;
    return obj;
  }

  async remove(id: string) {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return { deleted: true };
  }
}
