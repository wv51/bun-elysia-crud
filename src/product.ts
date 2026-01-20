import { Elysia, t } from "elysia";
import { prisma } from "./db";
import {
  ProductPlain,
  ProductPlainInputCreate,
  ProductPlainInputUpdate,
} from "../generated/prismabox/Product";

// แปลง Decimal เป็น number
const toResponse = (product: any) => ({
  id: product.id,
  name: product.name,
  detail: product.detail,
  price: product.price?.toNumber() ?? null,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export const productRoutes = new Elysia({ prefix: "/products" })
  // CREATE
  // ✅ แก้กลับเป็น create และรับ body
  .post(
    "/",
    async ({ body }) => {
      // 1. ต้องรับ body เข้ามา
      const product = await prisma.product.create({
        // 2. ใช้ create
        data: body,
      });
      return toResponse(product); // 3. return แค่ชิ้นเดียว
    },
    {
      body: ProductPlainInputCreate,
      response: ProductPlain,
    },
  )

  // READ ALL
  .get(
    "/",
    async () => {
      const products = await prisma.product.findMany();
      return products.map(toResponse);
    },
    {
      response: t.Array(ProductPlain),
    },
  )

  // READ ONE
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        set.status = 404;
        return "Product not found";
      }
      return toResponse(product);
    },
    {
      response: {
        200: ProductPlain,
        404: t.String(),
      },
    },
  )

  // UPDATE
  .patch(
    "/:id",
    async ({ params: { id }, body, set }) => {
      try {
        const product = await prisma.product.update({
          where: { id },
          data: body,
        });
        return toResponse(product);
      } catch {
        set.status = 404;
        return "Product not found";
      }
    },
    {
      body: ProductPlainInputUpdate,
      response: {
        200: ProductPlain,
        404: t.String(),
      },
    },
  )

  // DELETE
  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        await prisma.product.delete({ where: { id } });
        return { message: "Product deleted" };
      } catch {
        set.status = 404;
        return { message: "Product not found" };
      }
    },
    {
      response: t.Object({ message: t.String() }),
    },
  );
