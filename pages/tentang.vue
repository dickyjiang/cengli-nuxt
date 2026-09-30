<script setup lang="ts">
useHead({ title: 'Tentang | Cengli / Bo Cengli', meta: [{ name: 'description', content: 'Cengli / Bo Cengli: game polling santai untuk menilai kejadian sehari-hari, adil atau nggak.' }] })
</script>

<template>
  <div class="stack">
    <article class="prose card">
      <h1>Tentang</h1>
      <p><strong>Cengli / Bo Cengli</strong> adalah game polling santai. Orang menulis kejadian sehari-hari (kasus), lalu pengunjung lain menilai: <strong>Cengli</strong> (adil, wajar) atau <strong>Bo Cengli</strong> (nggak adil).</p>

      <h2>Apa arti "cengli"?</h2>
      <p>Kata <em>cengli</em> tercatat di Kamus Besar Bahasa Indonesia:</p>
      <blockquote>
        <p><strong>cengli</strong> /céngli/ <em>a cak</em></p>
        <p>1. sudah sepatutnya (semestinya); masuk akal</p>
        <p>2. lurus hati; jujur</p>
      </blockquote>
      <p>Istilah ini berasal dari bahasa <strong>Hokkien</strong> (Minnan) yang lama dipakai di Indonesia, lalu masuk ke percakapan sehari-hari:</p>
      <ul>
        <li><strong>Cengli</strong> (dari <em>情理</em>, <em>chêng-lí</em>): masuk akal, wajar, patut, dan adil.</li>
        <li><strong>Bo</strong> (dari <em>無</em>, <em>bô</em>): tidak atau tanpa.</li>
        <li><strong>Bo cengli</strong>: tidak wajar, tidak adil, atau tidak patut.</li>
      </ul>
      <p>Jadi di sini <strong>Cengli</strong> untuk kejadian yang menurutmu wajar dan adil, dan <strong>Bo Cengli</strong> untuk yang sebaliknya. Definisi Indonesianya bisa dilihat di <a href="https://kbbi.web.id/cengli" target="_blank" rel="noopener">kbbi.web.id/cengli</a>.</p>

      <h2>Cara kerjanya</h2>
      <ul>
        <li>Buka situs, pilih kasus, lalu vote. Tanpa akun.</li>
        <li>Satu orang satu suara per kasus. Hasil baru terlihat setelah kamu vote.</li>
        <li>Geser kartu untuk lanjut ke kasus berikutnya.</li>
        <li>Punya kasus sendiri? Tulis lewat menu, pilih kategori, lalu kirim. Kasus dicek dulu sebelum tayang.</li>
        <li>Riwayat vote dan kasus tulisanmu ada di menu Riwayatku, tersimpan di browser yang kamu pakai.</li>
      </ul>

      <h2>Yang perlu diingat</h2>
      <p>Hasil polling hanya pendapat pengunjung, bukan penilaian hukum atau moral yang sah. Ini untuk seru-seruan dan bahan ngobrol.</p>

      <h2>Kontak</h2>
      <p>Saran, laporan, atau permintaan penghapusan: <ContactEmail />.</p>

      <p class="row" style="gap: 0.75rem; flex-wrap: wrap">
        <NuxtLink to="/aturan" class="btn btn-ghost">Aturan & Privasi</NuxtLink>
        <NuxtLink to="/" class="btn btn-primary">Mulai vote</NuxtLink>
      </p>
    </article>
  </div>
</template>
