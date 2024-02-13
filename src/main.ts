import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  console.log('Database Configuration:');
  console.log('Host:', configService.get<string>('POSTGRES_HOST'));
  console.log('Port:', configService.get<number>('POSTGRES_PORT'));
  console.log('Database:', configService.get<string>('POSTGRES_DB'));
  console.log('Username:', configService.get<string>('POSTGRES_VYBE_USER'));
  console.log('Password:', configService.get<string>('POSTGRES_VYBE_PASSWORD'));
  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();

    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
