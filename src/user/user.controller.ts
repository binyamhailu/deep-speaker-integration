import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserProfileResponseDTO } from './dto/create-user.dto';
import axios from 'axios';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './entities/user.entity';
import * as FormData from 'form-data';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) { }
  
  @Get()
  async getUsers(){
    return this.userService.getAl()
  }
  @Post('enroll/:phoneNumber')
  @UseInterceptors(FileInterceptor('audio'))
  async uploadFile(
    @Param('phoneNumber') phoneNumber: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    try {
      if (!file) {
        throw new BadRequestException('enrollment Audio file is required');
      }
      if (!phoneNumber) {
        throw new BadRequestException('Phone Number is required');
      }
      let userProfile: User;
      userProfile = await this.userService.getUser(phoneNumber)

      if (!userProfile) {
        console.log("response-creating profile for user with Phone", phoneNumber)

        const id = await this.generateProfileId(10);
        const enrollmentStatus = "Enrolled";
        const profileStatus = "Active";

        const user: CreateUserDto = {
          phoneNumber: phoneNumber,
          profileId:id,
          enrollmentStatus: enrollmentStatus,
          profileStatus: profileStatus,
          enrolledVoice: file.buffer,
        }
        userProfile = await this.userService.create(user);
      }

      const user = {
        phoneNumber: userProfile.phoneNumber,
        profileId: userProfile.profileId,
        profileStatus: userProfile.profileStatus,
        enrollmentStatus: userProfile.enrollmentStatus
      }
      return {
        message: 'You have succesfully Enrolled a user',
        user
      };

    } catch (error) {
      console.log("ERROR", error)
      throw new InternalServerErrorException(error.response);
    }
  }
  @Post('verify/:phoneNumber')
  @UseInterceptors(FileInterceptor('audio'))
  async verifyUser(
    @Param('phoneNumber') phoneNumber: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      if (!file) {
        throw new BadRequestException('Audio file is required');
      }
      if (!phoneNumber) {
        throw new BadRequestException('Phone Number is required');
      }

      const user = await this.userService.getUser(phoneNumber);
      if (!user) {
        throw new NotFoundException(`User with Phone Number ${phoneNumber} not found`);
      }
      const data = new FormData();
      data.append('voice_sample1', user.enrolledVoice, { filename: 'enrolled_voice.wav' });
      data.append('voice_sample2', file.buffer, { filename: 'user_voice.wav' });

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://nvidia-speaker1-service:5000/verify-speakers',
        headers: {
          ...data.getHeaders(),
        },
        data: data,
      };

      const response = await axios.request(config);
      console.log('Response:', response.data);
      return response.data;
    }
    catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      throw new InternalServerErrorException(error.response ? error.response.data : error.message);
    }
  }
  // Function to generate a random string of specified length
  async generateProfileId(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
