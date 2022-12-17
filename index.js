let name = document.getElementById('name');
let pimkot = document.getElementById('pimkot');
let alamat = document.getElementById('alamat');
let phone = document.getElementById('phone');
let pendidikan = document.getElementById('pendidikan');
let position = document.getElementById('position');
let pekerjaan = document.getElementById('pekerjaan');
let minat = document.getElementById('minat');
let foto = document.getElementById('foto');
let alertSuccess = document.getElementById('alert-success');
let alertError = document.getElementById('alert-error');
let submit = document.getElementById('submit');
let reset = document.getElementById('reset');
let loading = document.getElementById('preloading');
let textLoading = document.getElementById('text-loading');

function resetForm() {
  name.value = '';
  pimkot.value = '';
  alamat.value = '';
  phone.value = '';
  pendidikan.value = '';
  position.value = '';
  pekerjaan.value = '';
  minat.value = '';
  foto.value = null;
}

reset.addEventListener('click', () => {
  resetForm();
});

submit.addEventListener('click', async event => {
  event.preventDefault();
  textLoading.textContent = '';
  const store = new SteinStore(
    'https://api.steinhq.com/v1/storages/639d48c9eced9b09e9aa4d4c'
  );
  loading.classList.remove('d-none');
  textLoading.textContent = 'Mengirim data...';
  document.body.style.overflow = 'hidden';

  if (
    name.value === '' ||
    pimkot.value === '' ||
    phone.value === '' ||
    alamat.value === '' ||
    pendidikan.value === '' ||
    position.value === '' ||
    pekerjaan.value === '' ||
    foto.value === ''
  ) {
    setTimeout(() => {
      loading.classList.add('d-none');
      alertError.classList.remove('d-none');
      document.body.style.overflow = 'visible';
    }, 1500);
    setTimeout(() => {
      alertError.classList.add('d-none');
    }, 10000);
  } else {
    await store
      .append('Sheet1', [
        {
          nama: name.value,
          no_hp: phone.value,
          asal_pimkot: pimkot.value,
          alamat: alamat.value,
          pendidikan: pendidikan.value,
          posisi: position.value,
          pekerjaan: pekerjaan.value,
          minat: minat.value
        }
      ])
      .then(res => {
        if (res) {
          alertSuccess.classList.remove('d-none');
          setTimeout(() => {
            alertSuccess.classList.add('d-none');
          }, 10000);
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

    textLoading.textContent = 'Generate Kartu Anggota';

    await generetPdf(name.value, pimkot.value);
    await resetForm();
    document.body.style.overflow = 'visible';
    loading.classList.add('d-none');
  }
});

var data = [];
var fileName = '';

encodeImageFileAsURL = element => {
  let file = element.files[0];
  let reader = new FileReader();
  reader.readAsDataURL(file);

  let obj = {
    list: reader,
    fileName: file.name,
    time: new Date().toString()
  };

  reader.onloadend = () => {
    data = [...data, obj];
  };
};

const generetPdf = async (name, pimkot) => {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;

  const exBytes = await fetch('./KTA.pdf').then(res => {
    return res.arrayBuffer();
  });

  // const exFont = await fetch('./Righteous-Regular.ttf').then(res => {
  //   return res.arrayBuffer();
  // });

  const pdfDoc = await PDFDocument.load(exBytes);

  pdfDoc.registerFontkit(fontkit);
  // const myFont = await pdfDoc.embedFont(exFont);
  const myFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages = pdfDoc.getPages();
  const firstP = pages[0];
  const { width, height } = firstP.getSize();

  console.log(width, height);
  firstP.drawText(name, {
    x: 80,
    y: 92,
    size: 9,
    font: myFont,
    color: rgb(0, 0, 0)
  });

  firstP.drawText(pimkot, {
    x: 80,
    y: 82,
    size: 8,
    font: myFont,
    color: rgb(0.5, 0.15, 0.2)
  });

  async function image() {
    if (data.length === 0) return;
    const jpgUrl = data[0].list.result;

    const jpgImageBytes = await fetch(jpgUrl).then(res => res.arrayBuffer());
    const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);

    console.log(jpgImage);

    firstP.drawImage(jpgImage, {
      x: 9.2,
      y: 24.5,
      width: 63,
      height: 74.5
    });
  }
  await image();

  data = [];

  const uri = await pdfDoc.saveAsBase64({ dataUri: true });
  saveAs(uri, `KTA-FPPI-${name}.pdf`, { autoBom: true });
};
