// 型の定義
interface GoodsList {
  id: number;
  name: string;
  price: number;
  discount: number;
}

interface CartItem {
  product: GoodsList;
  quantity: number;
}

type CurrentCartType = CartItem[] | null;

// 商品の情報と状態管理
const goodsData: GoodsList[] = [
  { id: 1, name: 'ガム', price: 100, discount: 0 },
  { id: 2, name: 'コーラ', price: 200, discount: 0.5 },  // 50％オフ
  { id: 3, name: '栄養ドリンク', price: 300, discount: 0.1 }, // 10%オフ
];

// 操作用の商品リスト配列コピー
let currentData: GoodsList[] = [...goodsData];
// カレントカート（初期状態は null）
let currentCart: CurrentCartType = [];

//要素の取得
const itemList = document.querySelectorAll(".item-list");
const cartHeader = document.querySelectorAll(".cart-header");
const cartCount = document.getElementById("cart-count");
const cartDiscount = document.getElementById("cart-discount");
const cartTotal = document.getElementById("cart-total");

//集計・金額の計算更新関数
function updateSummary(): void {
  let totalItems: number = 0;       // 合計点数
  let amountPrice: number = 0;      // 割引後の合計金額
  let totalDiscount: number = 0;    // 割引金額の合計
  if (currentCart) {
    currentCart.forEach((item: CartItem): void => {
      totalItems += item.quantity;
      const discountAmount: number = item.product.price * item.product.discount;
      const discountedPrice: number = item.product.price - discountAmount;

      totalDiscount += discountAmount * item.quantity;
      amountPrice += discountedPrice * item.quantity;
    });
  }
  // HTMLに反映
  if (cartCount) {
    cartCount.textContent = `${totalItems}点`;
  }
  if (cartDiscount) {
    cartDiscount.textContent = `¥${Math.floor(totalDiscount)}`;
  }
  if (cartTotal) {
    cartTotal.textContent = `¥${Math.floor(amountPrice)}`;
  }
  const cartLength: number = currentCart ? currentCart.length : 0;
  cartHeader.forEach((header: Element): void => {
    if (header instanceof HTMLElement) {
      header.textContent = header.classList.contains('summary-panel')
        ? `カート内(${cartLength})`
        : `カート(${cartLength})`;
    }
  });
}
// 商品リストの表示
function addGoods(): void {
  const container = itemList[0];
  if (!container) return;
  container.innerHTML = "";
  currentData.forEach((product: GoodsList): void => {
    const cardItem = document.createElement("div");
    cardItem.className = "card";
    // 割引表示の枠
    if (product.discount > 0) {
      const percent = product.discount * 100;
      const cardTop = document.createElement("div");
      cardTop.className = "card-top";

      const saleBadge = document.createElement("span");
      saleBadge.className = "sale-badge";
      saleBadge.textContent = "セール中:" + percent + "% OFF";
      cardTop.appendChild(saleBadge);
      cardItem.appendChild(cardTop);
    }
    // 商品名と価格の枠
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const nameEl = document.createElement("div");
    nameEl.className = "product-name";
    nameEl.textContent = product.name;

    const priceEl = document.createElement("div");
    priceEl.className = "product-price";
    priceEl.textContent = "¥" + product.price;

    cardBody.appendChild(nameEl);
    cardBody.appendChild(priceEl);
    cardItem.appendChild(cardBody);

    // カートに追加ボタン
    const addBtn = document.createElement("button");
    addBtn.className = "btn";
    addBtn.textContent = "カートに追加";

    // ボタンを押すイベント
    addBtn.addEventListener('click', (): void => {
      addCart(product.id);
    });

    cardItem.appendChild(addBtn);
    container.appendChild(cardItem);
  });
}
// カートリストの表示
function renderCart(): void {
  const container = itemList[1];
  if (!container) return;
  container.innerHTML = ""; // クリア
  const items = currentCart ?? [];
  items.forEach((item: CartItem): void => {
    const cardItem = document.createElement("div");
    cardItem.className = "card";

    const cardTop = document.createElement("div");
    cardTop.className = "card-top";

    if (item.product.discount > 0) {
      const percent = item.product.discount * 100;
      const saleBadge = document.createElement("span");
      saleBadge.className = "sale-badge";
      saleBadge.textContent = "セール中:" + percent + "% OFF";
      cardTop.appendChild(saleBadge);
    } else {
      const emptySpan = document.createElement("span");
      cardTop.appendChild(emptySpan);
    }
    // 数量選択（SelectBox）
    const selectEl = document.createElement("select");
    selectEl.className = "quantity-select";
    for (let i = 1; i <= 5; i++) {
      const option = document.createElement("option");
      option.value = i.toString();
      option.textContent = "×" + i;
      if (i === item.quantity) {
        option.selected = true;
      }
      selectEl.appendChild(option);
    }
    // 数量変更イベント
    selectEl.addEventListener("change", (e: Event): void => {
      const target = e.target;
      if (target instanceof HTMLSelectElement) {
        const qty = parseInt(target.value, 10);
        updateQuantity(item.product.id, qty);
      }
    });

    cardTop.appendChild(selectEl);
    cardItem.appendChild(cardTop);

    // 商品名と価格の枠
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const nameEl = document.createElement("div");
    nameEl.className = "product-name";
    nameEl.textContent = item.product.name;

    const priceEl = document.createElement("div");
    priceEl.className = "product-price";
    priceEl.textContent = "¥" + item.product.price;

    cardBody.appendChild(nameEl);
    cardBody.appendChild(priceEl);
    cardItem.appendChild(cardBody);

    // カートから削除ボタン
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn";
    removeBtn.textContent = "カートから削除";

    removeBtn.addEventListener("click", (): void => {
      removeCart(item.product.id);
    });
    cardItem.appendChild(removeBtn);
    container.appendChild(cardItem);
  });
}

// 商品リストからカートリストへ移動
function addCart(productId: number): void {
  const index = currentData.findIndex(
    (list: GoodsList) => list.id === productId
  );

  if (index >= 0) {
    const find = currentData[index];
    if (find) {
      if (currentCart === null) {
        currentCart = [];
      }
      const existingCartItem = currentCart.find(
        (item: CartItem) => item.product.id === productId
      );
      if (existingCartItem) {
        existingCartItem.quantity += 1;
      } else {
        currentCart.push({ product: find, quantity: 1 });
      }
      // 商品リストから削除
      currentData.splice(index, 1);
      // 画面全体を更新
      addGoods();
      renderCart();
      updateSummary();
    }
  }
}

// カートから商品を削除し、商品リストに戻す
function removeCart(productId: number): void {
  if (currentCart === null) return;
  const index: number = currentCart.findIndex(
    (item: CartItem) => item.product.id === productId
  );
  if (index >= 0) {
    const item = currentCart[index];
    if (item) {
      currentData.push(item.product);
      currentCart.splice(index, 1);
      if (currentCart.length === 0) {
        currentCart = null;
      }
      // 画面全体を更新
      addGoods();
      renderCart();
      updateSummary();
    }
  }
}

// SelectBoxで数量を変更
function updateQuantity(productId: number, quantity: number): void {
  if (currentCart === null) return;
  const item: CartItem | undefined = currentCart.find(
    (i: CartItem): boolean => i.product.id === productId
  );
  if (item) {
    item.quantity = quantity;
    updateSummary();
  }
}
addGoods();
renderCart();
updateSummary();
