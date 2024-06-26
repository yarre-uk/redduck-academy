import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

export default buildModule("WETH", (m) => {
  const weth = m.contract("WETH", []);

  const user1 = m.getAccount(0);
  const user2 = m.getAccount(1);
  const user3 = m.getAccount(2);

  m.call(weth, "mint", [ethers.parseEther("100")], {
    from: user1,
    id: "mint_user1",
  });
  m.call(weth, "mint", [ethers.parseEther("100")], {
    from: user2,
    id: "mint_user2",
  });
  m.call(weth, "mint", [ethers.parseEther("100")], {
    from: user3,
    id: "mint_user3",
  });

  return { weth };
});
