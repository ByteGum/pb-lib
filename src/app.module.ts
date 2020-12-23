import { Module } from '@nestjs/common';
import { TodoModule } from './todo/todo.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    TodoModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [configuration],
    }),
  ],
  providers: [],
})
export class AppModule {
}
