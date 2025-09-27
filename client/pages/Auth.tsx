import { SignIn, StackTheme } from "@stackframe/stack";

export default function Auth() {
  return (
    <div className="mx-auto max-w-md">
      <StackTheme>
        <SignIn />
      </StackTheme>
    </div>
  );
}
