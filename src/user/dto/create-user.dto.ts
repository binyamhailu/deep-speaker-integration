import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsNotEmpty, IsBase64 } from 'class-validator';

// export class CreateUserDto {
//   @ApiProperty()
//   @IsString()
//   phoneNumber: string;
// }

export class CreateUserDto {


  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  profileId: string;

  @IsOptional()
  @IsString()
  enrollmentStatus?: string;

  @IsOptional()
  @IsString()
  profileStatus?: string;

  @IsOptional()
  @IsBase64()
  enrolledVoice?: Buffer; 
}

export class VerifyUserDto {
  @ApiProperty()
  phoneNumber: string;
}

export class UserProfileResponseDTO {
  @ApiProperty()
  profileId: string;
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty()
  enrollmentStatus: string
  @ApiProperty()
  profileStatus: string
}
