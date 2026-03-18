import { LanguageSelect } from '@/shared/components/language-select';

export default function AuthFooter() {
  return (
    <div className='mx-auto flex w-full max-w-[1400px] items-center justify-between border-t border-[#E5E7EB] p-6'>
      <div className='text-[13px] text-[#6B7280]'>
        &copy; {new Date().getFullYear()} MIG Tender
      </div>

      {/* <LanguageSelect /> */}
    </div>
  );
}
