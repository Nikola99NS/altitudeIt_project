import React from 'react';

const VerificationCodeInput: React.FC<{ verificationCode: string, setVerificationCode: React.Dispatch<React.SetStateAction<string>> }> = ({ verificationCode, setVerificationCode }) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Verifikacioni kod</label>
            <div className="flex justify-between mt-1">
                {[...Array(6)].map((_, index) => (
                    <input
                        key={index}
                        type="text"
                        maxLength={1}
                        className="flex-1 w-1/6 h-12 mx-1 text-center border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                        onChange={(e) => {
                            setVerificationCode((prev) => {
                                const newCode = prev.split('');
                                newCode[index] = e.target.value;
                                return newCode.join('');
                            });
                            if (e.target.value) {
                                const nextInput = e.target.nextElementSibling as HTMLInputElement;
                                if (nextInput) nextInput.focus();
                            }
                        }}
                        onFocus={(e) => e.target.select()}
                    />
                ))}
            </div>
        </div>
    );
};

export default VerificationCodeInput;
