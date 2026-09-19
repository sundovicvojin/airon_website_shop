export type AdminActionState = Readonly<{
  message: string;
  success: boolean;
  fieldErrors?: Readonly<Record<string, readonly string[] | undefined>>;
}>;

export const initialAdminActionState: AdminActionState = { message: "", success: false };
