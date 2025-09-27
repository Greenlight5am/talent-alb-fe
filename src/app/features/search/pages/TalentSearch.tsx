import { useTranslations } from "@/shared/i18n/I18nProvider";

export default function TalentSearch() {
  const t = useTranslations();

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{t("talentSearch.title")}</h2>
      <p className="text-sm text-gray-600">{t("talentSearch.description")}</p>
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <input
          className="w-full rounded-2xl border p-3 shadow-sm"
          placeholder={t("talentSearch.placeholder")}
        />
        <div className="mt-2 text-xs text-gray-500">{t("talentSearch.demoLabel")}</div>
      </div>
    </div>
  );
}
