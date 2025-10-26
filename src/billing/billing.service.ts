import { Injectable } from '@nestjs/common';
import { FileService } from 'src/file-folder/file.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly userService: UserService,
  ) {}

  @Cron('0 0 1 * *')
  async runBilling(): Promise<void> {
    const users = await this.userService.listUsers();

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    for (const user of users) {
      const usage = await this.computeTotalStorageUsage(
        user.id,
        prevMonth,
        prevYear,
      );
      const amountToBill = await this.calculateBillingAmount(usage, user.id);

      if (amountToBill > 0) {
        await this.prisma.userBill.create({
          data: {
            id: uuidv4(),
            userId: user.id,
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            amount: amountToBill,
          },
        });
      }
    }
  }

  async calculateBillingAmount(usage: number, userId: string): Promise<number> {
    const userPlan = await this.prisma.userPlanPrice.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!userPlan) {
      throw new Error('User plan not found');
    }

    return usage * userPlan.pricePerByteSec;
  }

  async computeTotalStorageUsage(
    userId: string,
    month: number,
    year: number,
  ): Promise<number> {
    const startOfMonth = new Date(`${year}-${month}-01`);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Usage1 : Files not deleted
    const undeletedFiles = await this.fileService._retriveFileList(userId, {
      deletedAt: null,
    });
    const usage1 = undeletedFiles.map((file) => {
      const start =
        file.createdAt > startOfMonth ? file.createdAt : startOfMonth;
      const end = endOfMonth;

      const diffSec = (end.getTime() - start.getTime()) / 1000;
      return Number(file.size) * diffSec;
    });

    // Usage2 : Files deleted in the month
    const fileDeletedInMonth = await this.fileService._retriveFileList(userId, {
      deletedAt: { gt: new Date(`${year}-${month}-01`) },
    });
    const usage2 = fileDeletedInMonth.map((file) => {
      const start =
        file.createdAt > startOfMonth ? file.createdAt : startOfMonth;
      const end = file.deletedAt!;

      const diffSec = (end.getTime() - start.getTime()) / 1000;
      return Number(file.size) * diffSec;
    });

    return usage1.concat(usage2).reduce((a, b) => a + b, 0);
  }
}
