CREATE TABLE `door_commands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sale_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`saleId` integer NOT NULL,
	`productId` integer NOT NULL,
	`priceInCents` integer NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`saleId`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sale_items`("id", "saleId", "productId", "priceInCents", "quantity") SELECT "id", "saleId", "productId", "priceInCents", "quantity" FROM `sale_items`;--> statement-breakpoint
DROP TABLE `sale_items`;--> statement-breakpoint
ALTER TABLE `__new_sale_items` RENAME TO `sale_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;