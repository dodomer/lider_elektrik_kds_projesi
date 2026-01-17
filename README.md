LİDER ELEKTRİK KARAR DESTEK SİSTEMİ:

Projenin Amacı: Bu proje, Lider Elektrik depo yöneticisi için yapılmış olup projede kullanıcının en uygun depoları görmesi ve hangi depoyu hangi ürünlerle en optimal şekilde doldurması gerektiği sorusunu cevaplamaktır.
  Bu proje sayesinde kullanıcı; hızlı dönen ürünlerini, en çok ciro yapan ürünlerini, enflasyonu, yeni depoları, depoların haritadaki konumları gibi bileşenleri görebiliyor. Site içerisinde yer alan "En Uygun Depolar" kısmındaki
değişkenlere (mesafe, kapasite, kire) kendisi ağırlık vererek en uygun depoları listeleyebiliyor.

Senaryolar:

1- Stok Yetersizliği Kontrolü: Bir ürün için mevcut stok miktarı, sipariş edilen miktardan daha düşükse sipariş gerçekleşmez.

2- Stok Negatiflik Durumu: Stoğun negatif olması engellenmiştir.

3- Geçmiş tarihli veriler korunur. Çünkü satışlar ve analizler geçmiş verilerdir. Bu veriler silinirse analiz anlamsızlaşacağı için bu verilerin silinmesi engellenmiştir. Ürün ve depoların silinmesi bile veri tabanındaki "aktif mi" sütunu sayesinde soft delete ile yapılmaktadır.

4- Satışlar sadece mağazadan olmaktadır. Depodan satış yapılmamaktadır.

5- Sipariş sonrası eğer işlem başarılıysa mevcut stoktan verilen sipariş düşer.

6- Ağırlık bazlı en uygun depo seçilmesi sağlanmıştır. Kişinin kendi ağırlık değerlerine göre kullanıcıya "En Uygun Depolar" listesi sunulmuştur.


Kurulum Adımları: Öncelikle veri tabanının nasıl olacağı, neler gerektiğini yazdım. Ardından bir ER diyagramı şeklinde veri tabanını görselleştirmeye çalıştım. Veri tabanını kurduktan sonra depo yöneticisinin de isteklerini dinleyip
kurulum aşamasına geçtim. Çevik metodoloji ile ilerlediğim için depo yöneticisi ile hep iletişim halindeydim ve her isteğini (özellikle enflasyon kısmını istemişti) siteye eklemeye çalıştım.

NOT: Projeyi environment config kullanacak şekilde geliştirmiştim fakat güvenlik sebebiyle .env dosyasını GitHub’a eklemedim, bunun yerine sizin de dediğiniz gibi .env.example dosyasını GitHub'a yükledim.

API ENDPOINT LİSTESİ:

| Metod | Endpoint | Açıklama | CRUD |
|------|--------|---------|-------|
| GET | /api/enflasyon-tuik | TÜİK demo verisi ekler. (Gerçek TÜİK verisini izin vermedikleri için alamadım.) | - (Analiz) |
| GET | /api/kds/summary | Belirli bir yıl ve aya ait karar destek özet verilerini üretmek | - (Analiz) |
| GET | /api/health | Sistemin düzgün çalışıp çalışmadığını döndürür. | - |
| GET | /api/store/utilization | Deponun ne kadar dolu ne kadar boş olduğunu (ana doluluk oranını) json formatında döndürür. | - (Analiz) |
| GET | /api/depots | Depoların listesini koordinatlarıyla birlikte getirir. | READ |
| GET | /api/depolar-detay | Depoların detaylı bilgileriyle birlikte listesini getirir. Örneğin kapasitesi, aylık kirası, işletmeye olan uzaklığı gibi. | READ |
| POST | /api/depolar | Opsiyonel olarak fotoğraflarıyla birlikte yeni depo eklenmesini sağlar. | CREATE |
| PATCH | /api/depolar/:lokasyon_id/soft-delete | Depoyu soft delete olarak siler. DELETE kullanılmamasının sebebi soft delete olarak silinmiş olması. Yani aslında bir güncelleme yapılıyor. "Aktif miyiz" sütununu "0" olarak güncelliyor. | UPDATE |
| PATCH | /api/depolar/:lokasyon_id/satin-al | Güncelleme ile deponun satın alınmasını sağlar. "Sahip miyiz" sütununu "1" olarak değiştirir ve böylelikle depoyu satın almış oluruz. | UPDATE |
| GET | /api/monthly-revenue | Aylık ciroyu getirir. | - (Analiz) |
| GET | /api/sales-details | Seçilen aya göre en çok ciro getiren 10 ürünü getirir. | - (Analiz) |
| GET | /api/sales-trends | Her bir ürün için 6 aylık satış trendini getirir. | - (Analiz) |
| GET | /api/top-products | Seçilen aya göre en çok satılan 10 ürünü getirir. | -(Analiz) |
| GET | /api/top-selling | En çok satılan ürünler listesini gösterir ancak veri tabanından çekmediği için (eski front-end bu endpoint'i çağırdığı için) demo bir liste. Kullanılmıyor. | - (Demo) |
| POST | /api/analysis/run | Depo analizini başlatır. Yine eski bir front-end bu endpoint'i çağırdığı için kullanılmıyor. | - (Analiz) |
| GET | /api/analysis/latest | En sonki depo analizini getirir. Yine eski bir front-end bu endpoint'i çağırdığı için kullanılmıyor. | - (Analiz) |
| GET | /api/lokasyonlar | Tüm depoları ve mevcut mağazamızı mevcut dolulukları ve kapasiteleriyle birlikte döndürür. | READ |
| GET | /api/en-uygun-depolar | Kullanıcı tarafından girilmiş olan ağırlıklar sonucunda ortaya çıkan en uygun depoları listeler. | - |
| GET | /api/kategoriler | Veri tabanında yer alan tüm ürün kategorilerini listeler. | READ |
| GET | /api/urunler | Veri tabanında yer alan tüm ürünleri listeler. | READ |
| POST | /api/urunler | Veri tabanına yeni bir ürünü; adı, kategorisi, birim fiyatı, depo birimi, adeti ve eklenecek lokasyonuyla birlikte (bu ürün depoya mı eklenecek yoksa mağazaya mı?) ekler. | CREATE |
| PUT | /api/urunler:id | Belirli bir ürünü günceller | UPDATE |
| DELETE | /api/urunler:id | Soft delete yapılan ürünün mevcut stoklarını siler. | DELETE |
| POST | /api/decision-support | Seçilen aya göre analiz üretir ve yapay zeka önerisi döndürür. | - |
| GET | /api/ping | API router çalışıyor mu kontrolü yapar. | - |


