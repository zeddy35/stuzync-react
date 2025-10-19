export const metadata = { title: "KVKK Aydınlatma Metni • StuZync" };

export default function KVKKPage() {
  return (
    <div className="page-wrap py-8">
      <div className="section-card space-y-4">
        <h1 className="text-xl font-semibold">Kişisel Verilerin Korunması Aydınlatma Metni</h1>
        <p>
          StuZync olarak 6698 sayılı KVKK kapsamında, üyelerimizin kişisel verilerini; hizmet sunumu,
          kimlik doğrulama, güvenli giriş, iletişim ve mevzuata uyum amaçlarıyla işlemekteyiz.
        </p>
        <p>
          İşlenen veriler: ad, soyad, e-posta, (opsiyonel) telefon, profil görseli, kullanım/oturum bilgileri.
          Verileriniz, açık rızanız bulunmadıkça 3. kişilere aktarılmaz; barındırma, e-posta, veri tabanı gibi
          altyapı sağlayıcılarıyla sınırlı olarak paylaşılabilir.
        </p>
        <p>
          KVKK madde 11 kapsamındaki haklarınız (erişim, düzeltme, silme, itiraz vb.) için bizimle
          <a href="mailto:support@stuzync.com" className="underline ml-1">support@stuzync.com</a>
          adresinden iletişime geçebilirsiniz.
        </p>
        <p>
          Gizlilik ve veri güvenliği için uygun teknik ve idari tedbirleri almaktayız. Aydınlatma metninin güncel
          hâline sitemizden erişebilirsiniz.
        </p>
      </div>
    </div>
  );
}
