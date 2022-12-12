let name = document.getElementById('name');
let pimkot = document.getElementById('pimkot');
let arrival = document.getElementById('arrival');
let phone = document.getElementById('phone');
let keberangkatan = document.getElementById('keberangkatan');
let kepulangan = document.getElementById('kepulangan');
let position = document.getElementById('position');
let recomendation = document.getElementById('recomendation');
let alertSuccess = document.getElementById('alert-success');
let alertError = document.getElementById('alert-error');
let submit = document.getElementById('submit');
let loading = document.getElementById('preloading');
let textLoading = document.getElementById('text-loading');

submit.addEventListener('click', async event => {
  event.preventDefault();
  textLoading.textContent = '';
  const store = new SteinStore(
    'https://api.steinhq.com/v1/storages/63970c13eced9b09e9a93974'
  );
  loading.classList.remove('d-none');
  textLoading.textContent += 'Mengirim data ke Server...';

  if (
    name.value === '' ||
    pimkot.value === '' ||
    arrival.value === '' ||
    phone.value === '' ||
    keberangkatan.value === '' ||
    kepulangan.value === '' ||
    position.value === ''
  ) {
    setTimeout(() => {
      alertError.classList.add('d-none');
    }, 5000);
    setTimeout(() => {
      alertError.classList.remove('d-none');
      loading.classList.add('d-none');
    }, 3000);
  } else {
    await store
      .append('Sheet1', [
        {
          nama: name.value,
          nomer_hp: phone.value,
          asal_pimkot: pimkot.value,
          regional_keberangkatan: arrival.value,
          tanggal_berangkat: keberangkatan.value,
          tanggal_pulang: kepulangan.value,
          posisi_saat_ini: position.value,
          deskripsi_rekomendasi: recomendation.value
        }
      ])
      .then(res => {
        if (res) {
          alertSuccess.classList.remove('d-none');
          setTimeout(() => {
            alertSuccess.classList.add('d-none');
          }, 10000);
          textLoading.textContent = '...';
        } else {
          alertError.classList.remove('d-none');
          setTimeout(() => {
            alertError.classList.add('d-none');
          }, 10000);
        }
      })
      .catch(error => {
        alert(
          'There has been a problem with your fetch operation: ' + error.message
        );
      });

    textLoading.textContent += 'Generate Kartu Anggota...';

    await generetPdf(name.value, pimkot.value);
    name.value = '';
    pimkot.value = '';
    arrival.value = '';
    phone.value = '';
    keberangkatan.value = '';
    kepulangan.value = '';
    position.value = '';
    recomendation.value = '';
    loading.classList.add('d-none');
  }
});

const generetPdf = async (name, pimkot) => {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;

  const exBytes = await fetch('./Cert.pdf').then(res => {
    return res.arrayBuffer();
  });

  const exFont = await fetch('./Righteous-Regular.ttf').then(res => {
    return res.arrayBuffer();
  });

  const pdfDoc = await PDFDocument.load(exBytes);

  pdfDoc.registerFontkit(fontkit);
  const myFont = await pdfDoc.embedFont(exFont);
  //   const timesRomanFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let nameWidth = await myFont.widthOfTextAtSize(name, 18);
  let pimkotWidth = await myFont.widthOfTextAtSize(pimkot, 12);

  const pages = pdfDoc.getPages();
  const firstP = pages[0];
  const { width } = firstP.getSize();
  firstP.drawText(name, {
    x: (width - nameWidth) / 2,
    y: 85,
    size: 18,
    font: myFont,
    color: rgb(0, 0, 0)
  });

  firstP.drawText(pimkot, {
    x: (width - pimkotWidth) / 2,
    y: 70,
    size: 12,
    font: myFont,
    color: rgb(0, 0, 0)
  });

  const uri = await pdfDoc.saveAsBase64({ dataUri: true });
  saveAs(uri, `KTA-Kongres-${name}.pdf`, { autoBom: true });
  // document.querySelector("#myPDF").src = uri;
};
