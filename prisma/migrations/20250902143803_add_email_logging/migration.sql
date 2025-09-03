-- CreateTable
CREATE TABLE `email_logs` (
    `id` VARCHAR(191) NOT NULL,
    `toEmail` VARCHAR(191) NOT NULL,
    `fromEmail` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NOT NULL,
    `bodyText` TEXT NULL,
    `bodyHtml` TEXT NULL,
    `emailType` ENUM('VERIFICATION', 'PASSWORD_RESET', 'WELCOME', 'EVENT_NOTIFICATION', 'EVENT_REMINDER', 'EVENT_CANCELLED', 'GROUP_INVITATION', 'GROUP_NOTIFICATION', 'ADMIN_NOTIFICATION', 'GDPR_DATA_EXPORT', 'ACCOUNT_APPROVED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_DELETED', 'SYSTEM_ALERT', 'OTHER') NOT NULL,
    `userId` VARCHAR(191) NULL,
    `referenceId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'SENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `maxAttempts` INTEGER NOT NULL DEFAULT 3,
    `sentAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `openedAt` DATETIME(3) NULL,
    `clickedAt` DATETIME(3) NULL,
    `errorCode` VARCHAR(191) NULL,
    `errorMessage` TEXT NULL,
    `lastAttempt` DATETIME(3) NULL,
    `nextRetry` DATETIME(3) NULL,
    `provider` VARCHAR(191) NULL,
    `messageId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `email_logs_emailType_idx`(`emailType`),
    INDEX `email_logs_status_idx`(`status`),
    INDEX `email_logs_userId_idx`(`userId`),
    INDEX `email_logs_createdAt_idx`(`createdAt`),
    INDEX `email_logs_toEmail_idx`(`toEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `email_logs` ADD CONSTRAINT `email_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
