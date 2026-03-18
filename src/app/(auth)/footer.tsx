import { LanguageSelect } from '@/shared/components/language-select';

export default function AuthFooter() {
  return (
    <div className='mx-auto flex w-full max-w-[1400px] items-center justify-between p-6'>
      <div className='text-[14px] text-[#6B7280]'>
        © {new Date().getFullYear()} MIG Tender
      </div>

      {/* <LanguageSelect /> */}
    </div>
  );
}
