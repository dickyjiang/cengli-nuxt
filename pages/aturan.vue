<script setup lang="ts">
useHead({ title: 'Aturan & Privasi | Cengli / Bo Cengli' })
</script>

<template>
  <div class="stack">
    <article class="prose card">
      <h1>Aturan & Privasi</h1>
      <p class="muted">Diperbarui 29 September 2026. Situs ini masih versi beta, jadi isinya bisa berubah.</p>

      <h2>Aturan konten</h2>
      <p>Kasus yang kamu tulis akan dibaca dan dinilai orang lain. Supaya tetap aman dan enak dibaca:</p>
      <ul>
        <li>Pakai inisial atau A, B, C. Jangan menulis nama lengkap, alamat, nomor HP, akun sosial media, atau data pribadi orang lain.</li>
        <li>Jangan menyerang, menghina, atau menyudutkan orang tertentu. Jangan memuat SARA (suku, agama, ras, antargolongan), politik praktis (partai, pemilu, tokoh politik), ujaran kebencian, ancaman, atau konten dewasa. Kasus yang menyinggung hal-hal itu bisa ditahan untuk dicek dulu, atau ditolak.</li>
        <li>Jangan memasang tautan, iklan, atau promosi.</li>
        <li>Tulis kejadian yang benar-benar kamu alami atau lihat. Jangan mengarang tuduhan tentang orang nyata.</li>
      </ul>
      <p>Kasus dicek otomatis dan bisa dicek manual sebelum tayang. Kami berhak menolak, menyembunyikan, atau menghapus kasus dan kategori kapan saja tanpa pemberitahuan. Kalau melihat kasus yang bermasalah, pakai tautan "Laporkan kasus ini" di bawah kartu.</p>
      <p>Kamu bertanggung jawab atas isi kasus yang kamu kirim. Dengan mengirim, kamu mengizinkan kasus itu ditampilkan di situs ini.</p>

      <h2>Privasi</h2>
      <p>Situs ini tidak memakai akun, iklan, atau pelacak pihak ketiga.</p>
      <h3>Data yang kami simpan</h3>
      <ul>
        <li><strong>Teks kasus</strong> yang kamu kirim, kategorinya, dan waktu pengirimannya.</li>
        <li><strong>Vote</strong> kamu (Cengli atau Bo Cengli) untuk tiap kasus.</li>
        <li><strong>Laporan</strong> yang kamu kirim, bila ada.</li>
        <li>Semua data di atas dikaitkan dengan satu <strong>kode acak</strong> di cookie browsermu, bukan dengan nama atau email.</li>
      </ul>
      <h3>Cookie</h3>
      <p>Kami memasang satu cookie bernama <code>cbc_vid</code> berisi kode acak. Fungsinya mengenali browsermu supaya satu orang hanya bisa vote sekali per kasus, membatasi spam, dan menampilkan Riwayatku. Cookie ini berlaku sekitar satu tahun dan tidak dipakai untuk iklan. Kalau kamu menghapusnya, riwayatmu di browser itu ikut hilang.</p>
      <h3>Pihak lain</h3>
      <p>Situs ini berjalan di <strong>Cloudflare</strong> (hosting dan basis data). Formulir Tulis kasus memakai <strong>Cloudflare Turnstile</strong> untuk memastikan pengirim bukan bot; layanan itu bisa memproses data teknis seperti alamat IP dan info browser sesuai kebijakan Cloudflare.</p>
      <h3>Penghapusan</h3>
      <p>Mau kasusmu dihapus, atau punya pertanyaan soal datamu? Kirim email ke <a href="mailto:hello@dickyjiang.com">hello@dickyjiang.com</a> beserta tautan kasusnya. Kami tidak menjual data ke siapa pun.</p>

      <p class="row" style="gap: 0.75rem; flex-wrap: wrap">
        <NuxtLink to="/tentang" class="btn btn-ghost">Tentang</NuxtLink>
        <NuxtLink to="/" class="btn btn-primary">Kembali</NuxtLink>
      </p>
    </article>
  </div>
</template>
