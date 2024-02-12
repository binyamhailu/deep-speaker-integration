import { Injectable } from '@nestjs/common';
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
  async create(user:User): Promise<User> {
    
    const userProfile = new User();
    userProfile.phoneNumber = user.phoneNumber;
    userProfile.profileId= user.profileId
    return await this.userProfileRepository.save(userProfile);
  }
  async getUser(phoneNumber:string) {
    return await this.userProfileRepository.findOneBy({
      phoneNumber: phoneNumber
    })
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
