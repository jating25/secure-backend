import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  INestApplication,
  Logger,
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';


@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{

  private readonly logger =
    new Logger(PrismaService.name);



  constructor() {

    super({

      errorFormat: 'minimal',


      log:
        process.env.NODE_ENV === 'development'
          ? [
              {
                emit: 'stdout',
                level: 'query',
              },
              {
                emit: 'stdout',
                level: 'error',
              },
              {
                emit: 'stdout',
                level: 'warn',
              },
            ]
          : [
              {
                emit: 'stdout',
                level: 'error',
              },
            ],



      datasources: {

        db: {

          url:
            process.env.DATABASE_URL,

        },

      },

    });

  }



  async onModuleInit() {

    await this.$connect();


    this.logger.log(
      'Database connected successfully',
    );

  }




  async onModuleDestroy() {

    await this.$disconnect();


    this.logger.log(
      'Database disconnected',
    );

  }




  async enableShutdownHooks(
    app: INestApplication,
  ) {

    process.on(
      'beforeExit',
      async () => {

        await app.close();

      },
    );

  }

}
