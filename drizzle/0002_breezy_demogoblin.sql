PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_access_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cpf` text,
	`type` text NOT NULL,
	`status` text NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_access_logs`("id", "cpf", "type", "status", "createdAt") SELECT "id", "cpf", "type", "status", "createdAt" FROM `access_logs`;--> statement-breakpoint
DROP TABLE `access_logs`;--> statement-breakpoint
ALTER TABLE `__new_access_logs` RENAME TO `access_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `sales` ADD `userId` integer REFERENCES users(id);