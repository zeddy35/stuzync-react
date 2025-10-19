"use client";

import { useState } from "react";

export default function KvkkConsent({ onChange }: { onChange?: (v:boolean)=>void }) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="text-sm space-y-2">
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-1"
          checked={checked}
          onChange={(e)=>{ setChecked(e.target.checked); onChange?.(e.target.checked); }}
          required
          name="kvkk"
        />
        <span>
          <b>KVKK Aydınlatma Metni</b>’ni okudum, kişisel verilerimin işlenmesine ilişkin bilgilendirildim ve onay veriyorum.
          <button type="button" className="ml-2 underline" onClick={() => (document.getElementById("kvkk-modal") as any)?.showModal()}>
            Metni Gör
          </button>
        </span>
      </label>

      <dialog id="kvkk-modal" className="p-0 rounded-2xl w-full max-w-2xl">
        <div className="p-5 space-y-3">
          <h3 className="text-lg font-semibold">KVKK Aydınlatma Metni</h3>
          <div className="max-h-80 overflow-auto text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            <p>
              StuZync olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca;
              ad, soyad, iletişim bilgileri ve kullanım verileriniz; üyelik oluşturma, güvenli oturum,
              topluluk yönetimi, içerik paylaşımı ve hizmet iyileştirme amaçlarıyla işlenmektedir.
              Verileriniz, açık rızanızla sınırlı olmak üzere; hizmet sağlayıcılar ve altyapı
              tedarikçilerimizle paylaşılabilir ve KVKK’da öngörülen süreler boyunca saklanır.
              Haklarınız hakkında bilgi almak ve başvuruda bulunmak için bizimle iletişime geçebilirsiniz.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn btn-ghost" onClick={() => (document.getElementById("kvkk-modal") as any)?.close()}>Kapat</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
