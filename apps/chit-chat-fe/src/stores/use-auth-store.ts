import { create } from "zustand";
import { toast } from "sonner";
import type { AuthState } from "@/types/store";
import { authService } from "@/services/auth-service";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,
  signUp: async (username, password, email, firstName, lastName) => {
    try {
      set({ loading: true });

      await authService.signUp(username, password, email, firstName, lastName);

      toast.success(
        "Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập.",
      );

      return true;
    } catch (error) {
      console.error(error);

      toast.error("Đăng ký không thành công");

      return false;
    } finally {
      set({ loading: false });
    }
  },
  signIn: async (username, password) => {
    try {
      set({ loading: true });

      const { accessToken } = await authService.signIn(username, password);

      set({ accessToken });

      // get().setAccessToken(accessToken);
      // await get().fetchMe();
      toast.success("Chào mừng bạn quay lại với Chit Chat 🎉");
    } catch (error) {
      console.error(error);
      toast.error("Đăng nhập không thành công!");
    } finally {
      set({ loading: false });
    }
  },
}));
