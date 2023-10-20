import Navigo from 'navigo';
const api = "http://localhost:3000/products";
const form = document.getElementById('form-content');
const prdList = document.getElementById('prd-List');

const route = new Navigo("/",{linksSelector:"a"});
let editingID = null;

const fetchPrd = async() => {
  const res = await fetch(api);
  const prds = await res.json();
  prdList.innerHTML = "";
  prds.forEach((prd)=>{
    const prdItems = document.createElement("div");
    prdItems.innerHTML = `
      <h3>Tên sản phẩm: <a href="${prd.id}">${prd.name}</a></h3>
      <p>Giá sản phẩm: ${prd.price}</p>
      <p>Mô tả sản phẩm: ${prd.desc}</p>
      <button class="edit" data-id="${prd.id}" >Edit</button>
      <button class="delete" data-id="${prd.id}" >Delete</button>
    `
    prdList.appendChild(prdItems);
  })
  document.querySelectorAll('.edit').forEach(btnEdit=>{
    btnEdit.addEventListener('click',()=>{
      const prdID = btnEdit.getAttribute('data-id');
      editPrd(prdID);
    })
  })
  document.querySelectorAll('.delete').forEach(btnDelete=>{
    btnDelete.addEventListener('click',()=>{
      const prdID = btnDelete.getAttribute('data-id');
      deletePrd(prdID);
    })
  })
  route.on('/:id',async({data})=>{
    const prdID = data.id;
    prdList.innerHTML = await fetchOnePrd(prdID);
  }).resolve();
}

const fetchOnePrd = async (id) => {
  const res = await fetch(`${api}/${id}`);
  const prd = await res.json();
  return `
    <h2>Chi tiet san pham</h2>
    <div>
    <h3>Tên sản phẩm: <a href="${prd.id}">${prd.name}</a></h3>
    <p>Giá sản phẩm: ${prd.price}</p>
    <p>Mô tả sản phẩm: ${prd.desc}</p>
    </div>
  `
}

const performAct = async(apiEnd,method,data) => {
  try{
    const res = await fetch(apiEnd,{
      method:method,
      headers:{"Content-Type": "application/json"},
      body: JSON.stringify(data),
    })
    await res.json();
    fetchPrd();
    form.reset();
    editingID = null;
  }catch(e){
    console.log(e)
  }
}

const validate = (name,price,desc)=>{
  const err = document.getElementById('err');
  const parsedPrice = parseFloat(price);
  if(name.length === 0){
    err.innerHTML = "Tên sản phẩm không được để trống";
    return false;
  }
  else if(name.length < 6){
    err.innerHTML = "Tên sản phẩm không được ít hơn 6 kí tự";
    return false;
  }
  if(isNaN(parsedPrice)){
    err.innerHTML = "Giá sản phẩm không được để trống";
    return false
  }
  else if(parsedPrice <0){
    err.innerHTML = "Giá sản phẩm phải là số dương";
    return false;
  }
  return true;
}

const addPrd = (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const price = document.getElementById('price').value;
  const desc = document.getElementById('desc').value;
  if(!validate(name,price,desc)){
    return ;
  }
  const newPrd = {name,price,desc};
  const method = editingID ? "PUT" : "POST";
  const apiEnd = editingID ? `${api}/${editingID}` : api;
  performAct(apiEnd,method,newPrd);
}

const editPrd = async(id) => {
  editingID = id; 
  const res = await fetch(`${api}/${editingID}`);
  const prd = await res.json();

  document.getElementById('name').value = prd.name;
  document.getElementById('price').value = prd.price;
  document.getElementById('desc').value = prd.desc;
}

const deletePrd = async(id) => {
  const confirmDelete = confirm("Bạn có chắc chắn muốn xóa");
  if(confirmDelete){
    await fetch(`${api}/${id}`,{
      method: 'DELETE',
    })
    fetchPrd();
  }
}

form.addEventListener("submit",addPrd);
fetchPrd();