export const isMissingRelationError = (error: { code?: string; message?: string } | null) => {
  if (!error) return false;

  return (
    error.code === "42P01" ||
    error.message?.toLowerCase().includes("schema cache") ||
    error.message?.toLowerCase().includes("could not find the table") ||
    error.message?.toLowerCase().includes("relation")
  );
};
