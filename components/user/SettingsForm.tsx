"use client";

import { updatePassword, updateProfileImage, updateProfileInfo } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface SettingsFormProps {
    user: {
        name: string;
        nickname?: string | null;
        email: string;
        image?: string | null;
    };
}

export default function SettingsForm({ user }: SettingsFormProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(
        user.image || null
    );
    const [uploading, setUploading] = useState(false);
    const { update } = useSession();

    const [nameInput, setNameInput] = useState(user.name);
    const [nicknameInput, setNicknameInput] = useState(user.nickname || "");
    
    const profileInitialState = {
        error: "",
        success: false,
    };

    const [profileState, profileFormAction, isProfilePending] = useActionState(async (prevState: any, formData: FormData) => {
        const result = await updateProfileInfo(prevState, formData);
        if (result.error) {
            return { error: result.error, success: false };
        }
        
        const name = formData.get("name") as string;
        const nickname = formData.get("nickname") as string;
        await update({ name, nickname });
        
        return { error: "", success: true };
    }, profileInitialState);

    useEffect(() => {
        if (profileState.success) {
            toast.success("Profile details updated successfully");
        } else if (profileState.error) {
            toast.error(profileState.error);
        }
    }, [profileState]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 1MB)
        if (file.size > 1 * 1024 * 1024) {
            toast.error("Image size must be less than 1MB");
            e.target.value = ""; // Reset input
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append("image", file);

        setUploading(true);
        const result = await updateProfileImage(formData);
        setUploading(false);

        if (result.error) {
            toast.error(result.error);
            setImagePreview(user.image || null); // Revert on error
        } else {
            toast.success("Profile image updated");
            await update({ image: result.imageUrl });
        }
    };

    const initialState = {
        error: "",
        success: false,
    };

    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
        const result = await updatePassword(prevState, formData);
        if (result.error) {
            return { error: result.error, success: false };
        }
        return { error: "", success: true };
    }, initialState);

    useEffect(() => {
        if (state.success) {
            toast.success("Password updated successfully");
            // Optional: reset form fields
            const form = document.getElementById("password-form") as HTMLFormElement;
            if (form) form.reset();
        } else if (state.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <div className="space-y-8">
            {/* Profile Image Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Profile Image</h2>
                <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-100">
                        {imagePreview ? (
                            <Image
                                src={imagePreview}
                                alt="Profile"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    <div>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="max-w-[250px] bg-white text-gray-900 border-gray-300 file:text-gray-900 file:bg-gray-100 placeholder:text-gray-400"
                            disabled={uploading}
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            Recommended: Square image, max 1MB.
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Details Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Profile Details</h2>
                <form action={profileFormAction} className="space-y-4 max-w-md">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Display Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="nickname"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Nickname (Optional)
                        </label>
                        <Input
                            id="nickname"
                            name="nickname"
                            type="text"
                            value={nicknameInput}
                            onChange={(e) => setNicknameInput(e.target.value)}
                            placeholder="Enter a nickname"
                            className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            If set, your nickname will be displayed throughout the app instead of your display name.
                        </p>
                    </div>
                    <div>
                        <label
                            className="block text-sm font-medium text-gray-500 mb-1"
                        >
                            Email Address (Cannot be changed)
                        </label>
                        <Input
                            type="email"
                            disabled
                            value={user.email}
                            className="bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                        />
                    </div>
                    <Button type="submit" disabled={isProfilePending}>
                        {isProfilePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </div>

            {/* Password Update Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Change Password</h2>
                <form id="password-form" action={formAction} className="space-y-4 max-w-md">
                    <div>
                        <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Current Password
                        </label>
                        <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            required
                            className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            New Password
                        </label>
                        <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            required
                            className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Confirm New Password
                        </label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400"
                        />
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                    </Button>
                </form>
            </div>
        </div>
    );
}
