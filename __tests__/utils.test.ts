import { cn } from "../lib/utils";

describe("utils cn function", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should merge tailwind classes properly", () => {
    expect(cn("p-2", "p-4")).toBe("p-4"); // p-4 overrides p-2
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", true && "bar", false && "baz")).toBe("foo bar");
  });

  it("should handle arrays and objects", () => {
    expect(cn(["foo", "bar"], { baz: true, qux: false })).toBe("foo bar baz");
  });
});
