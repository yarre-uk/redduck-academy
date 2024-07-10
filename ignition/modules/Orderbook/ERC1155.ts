import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

export default buildModule("ERC1155", (m) => {
  const erc1155 = m.contract("MyERC1155", []);

  const user1 = m.getAccount(0);
  const user2 = m.getAccount(1);
  const user3 = m.getAccount(2);

  const tokenId = 0n;

  m.call(erc1155, "mint", [user1, tokenId, ethers.parseEther("1"), "0x"], {
    id: "mint1",
  });
  m.call(erc1155, "mint", [user2, tokenId, ethers.parseEther("1"), "0x"], {
    id: "mint2",
  });
  m.call(erc1155, "mint", [user3, tokenId, ethers.parseEther("1"), "0x"], {
    id: "mint3",
  });

  return { erc1155 };
});
