import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userProfileRepository: Repository<User>,
  ) {}
  async create(user:CreateUserDto): Promise<User> {
    return await this.userProfileRepository.save(user);
  }
  async update(user: UpdateUserDto): Promise<User> {
    try {
      const existingUser = await this.userProfileRepository.findOneBy({ phoneNumber:user.phoneNumber });
      if (!existingUser) {
        throw new NotFoundException(`User with phone number ${user.phoneNumber} not found`);
      }
  
      // Update user properties
      existingUser.profileId = user.profileId;
      existingUser.enrollmentStatus = user.enrollmentStatus;
      existingUser.profileStatus = user.profileStatus;
      existingUser.enrolledVoice = user.enrolledVoice;
  
      return await this.userProfileRepository.save(existingUser);
    } catch (error) {
      console.error("ERROR", error);
      throw new InternalServerErrorException(error.message);
    }
  }
  
  async getUser(phoneNumber:string) {
    return await this.userProfileRepository.findOneBy({
      phoneNumber: phoneNumber
    })
  }
  async getAl() {
    return await this.userProfileRepository.find()
  }
  async updateUserStatus(profileId:string){
    const user = await this.userProfileRepository.findOneBy({
      profileId:profileId
    })
    if(user){
      user.enrollmentStatus="Enrolled"
      this.userProfileRepository.save(user);
    }
  }

}
