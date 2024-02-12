import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty()
  phoneNumber: string;
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
