/* eslint-disable @typescript-eslint/no-misused-promises */
import { Dialog } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { type SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineClose } from "react-icons/ai";
import { z } from "zod";

import { api, type RouterOutputs } from "~/utils/api";

export const profileEditSchema = z.object({
  userId: z.string(),
  firstName: z.string().min(1, { message: "First name can't be blank" }).max(63),
  lastName: z.string().min(1, { message: "Last name can't be blank" }).max(63),
  description: z.string().min(0).max(511),
});

type ProfileEditSchema = z.infer<typeof profileEditSchema>;

type User = RouterOutputs["profile"]["getByUsername"];
const EditProfileModal: React.FC<{
  user: User;
  isOpen: boolean;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
}> = ({ user, isOpen, setIsOpen }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileEditSchema>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      description: user.description,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        description: user.description,
      });
    }
  }, [isOpen, reset, user]);

  const ctx = api.useContext();
  const { mutate } = api.profile.edit.useMutation({
    onSuccess: async () => {
      await Promise.all([
        ctx.profile.getByUsername.invalidate({
          username: user.username,
        }),
        ,
        ctx.posts.list.invalidate(),
      ]);
      setIsOpen(false);
    },
  });

  const submitDisabled = Object.keys(errors).length > 0;
  return (
    <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)} open={isOpen}>
      <div className="fixed inset-0 overflow-y-auto bg-slate-300 bg-opacity-20">
        <div className="flex min-h-full items-center justify-center text-center">
          <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-black text-left align-middle transition-all">
            <form onSubmit={handleSubmit((values) => mutate(values))}>
              <Dialog.Title as="div" className="m-3 flex items-center gap-7 text-xl font-bold">
                <button onClick={() => setIsOpen(false)}>
                  <AiOutlineClose />
                </button>
                <h1>Edit Profile</h1>
                <button
                  type="submit"
                  className={`ml-auto rounded-full bg-white px-5 py-2 text-sm text-black ${
                    submitDisabled ? "opacity-50" : ""
                  }`}
                  disabled={submitDisabled}
                >
                  Save
                </button>
              </Dialog.Title>
              <div className="relative h-48 max-w-full">
                <Image src={user.profileImageUrl} alt={user.username} fill />
              </div>
              <div className="relative">
                <Image
                  src={user.profileImageUrl}
                  alt={user.username}
                  className="absolute left-2 top-[-60px] rounded-full border-4 border-black bg-black"
                  width={120}
                  height={120}
                />
              </div>
              <div className="m-16" />
              <div className="flex flex-col gap-6 px-4 pb-4 pt-2">
                <input {...register("userId")} type="hidden" />
                <div className="flex flex-col">
                  <input
                    {...register("firstName")}
                    className="grow rounded-md border border-slate-600 bg-black p-2"
                  />
                  <p className="ml-2 text-sm text-red-500">{errors.firstName?.message}</p>
                </div>
                <div className="flex flex-col">
                  <input
                    {...register("lastName")}
                    className="grow rounded-md border border-slate-600 bg-black p-2"
                  />
                  <p className="ml-2 text-sm text-red-500">{errors.lastName?.message}</p>
                </div>
                <div className="flex flex-col">
                  <textarea
                    {...register("description")}
                    placeholder="Bio"
                    className="resize-none rounded-md border border-slate-600 bg-black p-2"
                    rows={3}
                  />
                  <p className="ml-2 text-sm text-red-500">{errors.description?.message}</p>
                </div>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default EditProfileModal;
