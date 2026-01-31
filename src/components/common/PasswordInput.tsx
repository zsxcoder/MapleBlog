import React, { useState, useEffect } from "react";

interface Props {
  encrypted: boolean;
  passwordHash?: string;
  onUnlock: () => void;
}

const PasswordInput: React.FC<Props> = ({ encrypted, passwordHash, onUnlock }) => {
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hashPassword = async (input: string): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      return hashHex;
    } catch {
      throw new Error("Crypto API not available");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError(false);

    try {
      const inputHash = await hashPassword(password);

      if (inputHash === passwordHash) {
        setIsLoading(false);
        onUnlock();
      } else {
        setIsLoading(false);
        setError(true);
        setPassword("");
      }
    } catch (err) {
      setIsLoading(false);
      setError(true);
    }
  };

  if (!mounted || !encrypted) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="glass rounded-[35px] p-8 w-full max-w-md text-center intersect:animate-fadeUp opacity-0">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--primary)]"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-txt-p dark:text-darkmode-txt-p mb-2">
            文章已加密
          </h2>
          <p className="text-txt-light dark:text-darkmode-txt-light text-sm">
            请输入密码查看文章内容
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="请输入密码"
              className="w-full glass rounded-[20px] px-5 py-3 text-txt-p dark:text-darkmode-txt-p placeholder:text-txt-light dark:placeholder:text-darkmode-txt-light focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center justify-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                密码错误，请重试
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!password || isLoading}
            className="w-full rounded-[20px] px-5 py-3 bg-[var(--primary)] text-white font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                验证中...
              </span>
            ) : (
              "解锁文章"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordInput;
