CREATE TABLE "deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"source" text NOT NULL,
	"product_link" text NOT NULL,
	"image_url" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"discount_percent" numeric(5, 2),
	"currency" text DEFAULT 'USD' NOT NULL,
	"search_query" text NOT NULL,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
