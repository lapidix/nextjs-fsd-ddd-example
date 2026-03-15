import { UserAvatar } from "@/entities/user/ui";
import { Input } from "@/shared/ui/input";

interface CommentFormProps extends React.HTMLAttributes<HTMLFormElement> {
  userProfileImage: string;
}

export const CommentForm = ({
  userProfileImage,
  className,
  ...props
}: CommentFormProps) => {
  return (
    <form
      {...props}
      onSubmit={() => {}}
      className={`flex items-center mb-6 gap-4 ${className}`}>
      <UserAvatar userProfileImage={userProfileImage} />
      <Input
        type="text"
        placeholder="Enter a comment..."
        onChange={(e) => {
          console.log(e);
        }}
      />
      <button
        type="submit"
        className=" text-slate-600 hover:text-teal-600 font-medium text-sm cursor-pointer"
        disabled={!"".trim()}>
        Post
      </button>
    </form>
  );
};
