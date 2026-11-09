const USERS_KEY = "contigo.users";
const SESSION_KEY = "contigo.session";
const PENDING_KEY = "contigo.pending";
const RECEIPTS_KEY = "contigo.receipts";
const GUIDE_KEY = "contigo.guide";
function readJson(storage, key) {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

function writeJson(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    showToast("No pudimos guardar tus datos en este navegador. Revisa que no esté en modo privado.");
  }
}

function getUsers() {
  return readJson(localStorage, USERS_KEY) || [];
}

function findUserByPhone(phone) {
  return getUsers().find(function (user) {
    return user.phone === phone;
  });
}

function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return getUsers().find(function (user) {
    return user.email === normalized;
  });
}

function findUserById(id) {
  return getUsers().find(function (user) {
    return user.id === id;
  });
}

function createUser(data) {
  const users = getUsers();
  const user = {
    id: Date.now(),
    name: data.name,
    age: data.age,
    phone: data.phone,
    email: data.email.toLowerCase(),
    password: data.password,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  writeJson(localStorage, USERS_KEY, users);
  return user;
}
function updateUser(userId, changes) {
  const users = getUsers();
  const user = users.find(function (item) {
    return item.id === userId;
  });

  if (!user) {
    return null;
  }

  Object.assign(user, changes);
  user.email = user.email.toLowerCase();
  writeJson(localStorage, USERS_KEY, users);
  return user;
}
function startSession(userId, remember) {
  endSession();
  const storage = remember ? localStorage : sessionStorage;
  writeJson(storage, SESSION_KEY, { userId: userId });
}

function getSessionUser() {
  const session = readJson(sessionStorage, SESSION_KEY) || readJson(localStorage, SESSION_KEY);
  return session ? findUserById(session.userId) : null;
}

function endSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
  }
}

function requireSession() {
  const user = getSessionUser();
  if (!user) {
    window.location.replace("index.html#login");
  }
  return user;
}

function savePending(data) {
  writeJson(sessionStorage, PENDING_KEY, data);
}

function getPending() {
  return readJson(sessionStorage, PENDING_KEY);
}

function clearPending() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch (error) {
  }
}
function getReceipts(userId) {
  const receipts = readJson(localStorage, RECEIPTS_KEY) || [];
  return receipts
    .filter(function (receipt) {
      return receipt.userId === userId;
    })
    .sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
}

function saveReceipt(receipt) {
  const receipts = readJson(localStorage, RECEIPTS_KEY) || [];
  receipts.push(receipt);
  writeJson(localStorage, RECEIPTS_KEY, receipts);
}

function findReceipt(receiptId) {
  const receipts = readJson(localStorage, RECEIPTS_KEY) || [];
  return receipts.find(function (receipt) {
    return receipt.id === receiptId;
  });
}

function clearGuide() {
  try {
    sessionStorage.removeItem(GUIDE_KEY);
  } catch (error) {
  }
}