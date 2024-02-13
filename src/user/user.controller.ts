import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserProfileResponseDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import axios from 'axios';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './entities/user.entity';
import { CustomNotFoundException } from './exception/NotFoundException';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) { }

  @Post("profile/:phoneNumber")
  async create( @Param('phoneNumber') phoneNumber: string,
  ): Promise<UserProfileResponseDTO> {
    
    if(!phoneNumber){
      throw new NotFoundException("Phone Number is required Field");
    }
    
    try {
      const data = JSON.stringify({
        "locale": "en-us"
      });

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://eastus.api.cognitive.microsoft.com/speaker-recognition/verification/text-independent/profiles?api-version=2021-09-05',
        headers: {
          'Ocp-Apim-Subscription-Key': '050acd7a1d3c4f0ab8123516e708b8f5',
          'Content-Type': 'application/json'
        },
        data: data
      };

      const response = await axios.request(config);
      console.log("response-creating profile", response.data)

      const profileId = response.data.profileId;
      const enrollmentStatus = response.data.enrollmentStatus;
      const profileStatus = response.data.profileStatus;
      const user: User = {
        phoneNumber: phoneNumber,
        profileId: profileId,
        enrollmentStatus: enrollmentStatus,
        profileStatus: profileStatus,
        id: 0
      }
      const userProfile = await this.userService.create(user);

      return {
        profileId: userProfile.profileId,
        phoneNumber: userProfile.phoneNumber,
        profileStatus: profileStatus,
        enrollmentStatus: enrollmentStatus
      };

    } catch (error) {
      console.log("ERROR", error)
      throw new Error("Falied to create a profile");
    }
  }
  @Post('enroll/:phoneNumber')
  @UseInterceptors(FileInterceptor('audio'))
  async uploadFile(
    @Param('phoneNumber') phoneNumber: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    try {
      if (!file) {
        throw new BadRequestException('Audio file is required');
      }
      if (!phoneNumber) {
        throw new BadRequestException('Phone Number is required');
      }
      let userProfile;
      userProfile = await this.userService.getUser(phoneNumber)
      if (!userProfile) {
        const data = JSON.stringify({
          "locale": "en-us"
        });
  
        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://eastus.api.cognitive.microsoft.com/speaker-recognition/verification/text-independent/profiles?api-version=2021-09-05',
          headers: {
            'Ocp-Apim-Subscription-Key': '050acd7a1d3c4f0ab8123516e708b8f5',
            'Content-Type': 'application/json'
          },
          data: data
        };
  
        const response = await axios.request(config);
        console.log("response-creating profile", response.data)
  
        const profileId = response.data.profileId;
        const enrollmentStatus = response.data.enrollmentStatus;
        const profileStatus = response.data.profileStatus;
        const user: User = {
          phoneNumber: phoneNumber,
          profileId: profileId,
          enrollmentStatus: enrollmentStatus,
          profileStatus: profileStatus,
          id: 0
        }
         userProfile = await this.userService.create(user);
      }

      const data = file.buffer;
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://eastus.api.cognitive.microsoft.com/speaker-recognition/verification/text-independent/profiles/${userProfile.profileId}/enrollments?api-version=2021-09-05&ignoreMinLength=true`,
        headers: {
          'Ocp-Apim-Subscription-Key': '050acd7a1d3c4f0ab8123516e708b8f5',
          'Content-Type': 'audio/wav; codecs=audio/pcm'
        },
        data: data
      };

      const response = await axios.request(config);
      console.log("response", response.data);


      const profileId = response.data.profileId;
      const enrollmentStatus = response.data.enrollmentStatus;
      const profileStatus = response.data.profileStatus;
      if (enrollmentStatus === "Enrolled") {
        const user = await this.userService.updateUserStatus(profileId);

        return {
          message: 'You have succesfully Enrolled a user',
          data: {
            phoneNumber,
            profileId,
            profileStatus: "Active",
            enrollmentStatus
          },
        };
      }

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
      const user = await this.userService.getUser(phoneNumber)
      if (!user) {
        return new NotFoundException("User Not Found  With Phone Number", phoneNumber)
      }

      const data = file.buffer;
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        // url: `https://eastus.api.cognitive.microsoft.com/speaker-recognition/verification/text-independent/profiles/${user.profileId}/enrollments?api-version=2021-09-05&ignoreMinLength=true`,
        url: `https://eastus.api.cognitive.microsoft.com/speaker-recognition/verification/text-independent/profiles/${user.profileId}:verify?api-version=2021-09-05&ignoreMinLength=true`,
        headers: {
          'Ocp-Apim-Subscription-Key': '050acd7a1d3c4f0ab8123516e708b8f5',
          'Content-Type': 'audio/wav; codecs=audio/pcm'
        },
        data: data
      };

      const response = await axios.request(config);
      console.log("response", response.data);

      return response.data;

    } catch (error) {
      console.log("ERROR", error)
      throw new InternalServerErrorException(error.response);
    }
  }
}
