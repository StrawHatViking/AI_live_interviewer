import { describe, expect, test } from "bun:test";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";

describe("ApiError", () => {
  test("creates error with correct status code and message", () => {
    const error = new ApiError(404, "Not found");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.success).toBe(false);
    expect(error.data).toBeNull();
    expect(error.errors).toEqual([]);
  });

  test("creates error with custom errors array", () => {
    const errors = [{ field: "github", message: "Invalid URL" }];
    const error = new ApiError(400, "Validation failed", errors);
    expect(error.statusCode).toBe(400);
    expect(error.errors).toEqual(errors);
  });

  test("captures stack trace", () => {
    const error = new ApiError(500, "Server error");
    expect(error.stack).toBeDefined();
  });
});

describe("ApiResponse", () => {
  test("creates success response with data", () => {
    const response = new ApiResponse(200, { id: "123" }, "Success");
    expect(response.statusCode).toBe(200);
    expect(response.data).toEqual({ id: "123" });
    expect(response.message).toBe("Success");
    expect(response.success).toBe(true);
  });

  test("marks success as false for status >= 400", () => {
    const response = new ApiResponse(500, null, "Error");
    expect(response.success).toBe(false);
  });
});
