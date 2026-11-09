const USERS_KEY = "contigo.users";
const SESSION_KEY = "contigo.session";
const PENDING_KEY = "contigo.pending";
const RECEIPTS_KEY = "contigo.receipts";
const GUIDE_KEY = "contigo.guide";
const BILLS_KEY = "contigo.bills";
const PROGRESS_KEY = "contigo.progress";
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

function getAllBills() {
  return readJson(localStorage, BILLS_KEY) || [];
}

function getBills(userId) {
  return getAllBills().filter(function (bill) {
    return bill.userId === userId;
  });
}

function findBill(billId) {
  return getAllBills().find(function (bill) {
    return bill.id === billId;
  });
}

function saveBill(bill) {
  const bills = getAllBills().filter(function (item) {
    return item.id !== bill.id;
  });
  bills.push(bill);
  writeJson(localStorage, BILLS_KEY, bills);
  return bill;
}

function getAllProgress() {
  return readJson(localStorage, PROGRESS_KEY) || [];
}

function getProgressList(userId) {
  return getAllProgress()
    .filter(function (progress) {
      return progress.userId === userId;
    })
    .sort(function (a, b) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
}

function getProgress(userId, procedureId) {
  return getAllProgress().find(function (progress) {
    return progress.userId === userId && progress.id === procedureId;
  });
}

function saveProgress(progress) {
  const list = getAllProgress().filter(function (item) {
    return !(item.userId === progress.userId && item.id === progress.id);
  });
  progress.updatedAt = new Date().toISOString();
  list.push(progress);
  writeJson(localStorage, PROGRESS_KEY, list);
}

function clearProgress(userId, procedureId) {
  const list = getAllProgress().filter(function (item) {
    return !(item.userId === userId && item.id === procedureId);
  });
  writeJson(localStorage, PROGRESS_KEY, list);
}